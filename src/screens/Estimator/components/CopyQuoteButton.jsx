import { buildQuoteText } from "@/shared/utils/buildQuoteText.js";

export default function CopyQuoteButton({ draft, totals, onCopied }) {
    async function handleCopy() {
        try {
            const text = buildQuoteText(draft, totals);
            await navigator.clipboard.writeText(text);
            onCopied?.();
        } catch (error) {
            console.error("Не удалось скопировать КП:", error);
        }
    }

    return (
        <button
            type="button"
            onClick={handleCopy}
            disabled={!draft?.lineItems?.length}
        >
            Скопировать КП
        </button>
    );
}