<?php
// public_html/api/lead.php

header('Content-Type: application/json; charset=utf-8');

// CORS (если фронт и api на одном домене — можно вообще убрать)
$allowedOrigin = ''; // например: 'https://calc.vnukov...'
if ($allowedOrigin) {
  header('Access-Control-Allow-Origin: ' . $allowedOrigin);
  header('Vary: Origin');
}
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(204);
  exit;
}
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['ok' => false, 'error' => 'METHOD_NOT_ALLOWED']);
  exit;
}

// === НАСТРОЙКИ ===
// В идеале вынести в отдельный config.php вне public_html.
// Но для старта можно так:
$RESEND_API_KEY = 'PASTE_RESEND_API_KEY_HERE';
$MAIL_FROM = 'Estimator <onboarding@resend.dev>'; // или ваш домен после верификации
$LEADS_TO = 'strannik19742@mail.ru';

// Простейшая защита от спама (секретная строка, известна только фронту и серверу)
// Можно включить позже. Пока закомментировано.
// $SHARED_SECRET = 'SOME_LONG_SECRET';

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);

if (!is_array($data)) {
  http_response_code(400);
  echo json_encode(['ok' => false, 'error' => 'BAD_JSON']);
  exit;
}

// if (!isset($data['secret']) || $data['secret'] !== $SHARED_SECRET) {
//   http_response_code(403);
//   echo json_encode(['ok' => false, 'error' => 'FORBIDDEN']);
//   exit;
// }

$estimateText = $data['estimateText'] ?? '';
if (!is_string($estimateText) || mb_strlen($estimateText) < 10) {
  http_response_code(400);
  echo json_encode(['ok' => false, 'error' => 'BAD_ESTIMATE_TEXT']);
  exit;
}

$title = is_string($data['title'] ?? null) ? $data['title'] : '';
$contact = is_string($data['contact'] ?? null) ? $data['contact'] : '';
$clientEmail = is_string($data['clientEmail'] ?? null) ? $data['clientEmail'] : '';

$total = $data['total'] ?? null;
$days = $data['days'] ?? null;

function money_ru($n) {
  if (!is_numeric($n)) return '—';
  return number_format((float)$n, 0, '.', ' ') . ' ₽';
}
function days_ru($n) {
  if (!is_numeric($n)) return '—';
  return '~' . (int)round((float)$n) . ' дней';
}

$price = money_ru($total);
$daysStr = days_ru($days);
$subject = 'Смета: ' . $price . ' (' . $daysStr . ')' . ($title ? (' — ' . $title) : '');

$textBody = $subject . "\n"
  . ($contact ? ("Контакт: " . $contact . "\n") : "")
  . ($clientEmail ? ("Email клиента: " . $clientEmail . "\n") : "")
  . "\n---\nОценка ориентировочная. Итог уточняется после обсуждения.\n---\n\n"
  . $estimateText . "\n";

$estimateJson = $data['estimateJson'] ?? new stdClass();
$jsonStr = json_encode($estimateJson, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
$jsonB64 = base64_encode($jsonStr);

// helper: send Resend email
function resend_send($apiKey, $from, $to, $subject, $text, $attachmentB64) {
  $payload = [
    'from' => $from,
    'to' => $to,
    'subject' => $subject,
    'text' => $text,
    'attachments' => [
      [
        'filename' => 'estimate.json',
        'content' => $attachmentB64
      ]
    ]
  ];

  $ch = curl_init('https://api.resend.com/emails');
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
  curl_setopt($ch, CURLOPT_POST, true);
  curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . $apiKey,
    'Content-Type: application/json'
  ]);
  curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
  $resp = curl_exec($ch);
  $http = curl_getinfo($ch, CURLINFO_HTTP_CODE);
  curl_close($ch);

  return [$http, $resp];
}

// 1) письмо тебе
list($http1, $resp1) = resend_send($RESEND_API_KEY, $MAIL_FROM, $LEADS_TO, $subject, $textBody, $jsonB64);
if ($http1 < 200 || $http1 >= 300) {
  http_response_code(500);
  echo json_encode(['ok' => false, 'error' => 'SEND_TO_OWNER_FAILED', 'status' => $http1]);
  exit;
}

// 2) письмо клиенту (best effort)
$clientSent = false;
if ($clientEmail) {
  list($http2, $resp2) = resend_send($RESEND_API_KEY, $MAIL_FROM, $clientEmail, 'Ваша смета: ' . $price . ' (' . $daysStr . ')', $estimateText, $jsonB64);
  if ($http2 >= 200 && $http2 < 300) $clientSent = true;
}

echo json_encode(['ok' => true, 'clientSent' => $clientSent]);