import { buildQuoteText } from "@/shared/core/quoteText.js";

export default function CopyQuoteButton({ draft, totals, onCopied }) {
    async function onCopy() {
        const text = buildQuoteText(draft, totals);

        try {
            await navigator.clipboard.writeText(text);
            onCopied?.();
        } catch {
            window.prompt("Скопируй вручную:", text);
        }
    }

    return (
        <button className="primary" type="button" onClick={onCopy} disabled={!draft.lineItems.length}>
            Скопировать смету
        </button>
    );
}