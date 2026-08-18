/**
 * Utility to sanitize and format math formulas.
 * Removes ugly LaTeX dollar sign delimiters ($...$ and $$...$$) and replaces
 * common LaTeX artifacts (\times, \frac, \sqrt, \pm, \approx, etc.) with clean unicode math symbols.
 */

export function cleanMathText(text: string | undefined | null): string {
  if (!text) return '';

  let cleaned = text;

  // 1. Remove double dollar blocks ($$...$$) and single dollar inline ($...$)
  // If the dollar sign is immediately adjacent to a number like $10 or $99 (currency), keep it only if clearly currency.
  // Otherwise, strip the math delimiter dollar signs:
  // First, convert LaTeX command patterns before removing dollars
  cleaned = cleaned
    // Convert \times or \cdot
    .replace(/\\times\b/g, '×')
    .replace(/\\cdot\b/g, '·')
    .replace(/\\div\b/g, '÷')
    .replace(/\\pm\b/g, '±')
    .replace(/\\mp\b/g, '∓')
    .replace(/\\approx\b/g, '≈')
    .replace(/\\neq\b/g, '≠')
    .replace(/\\leq?\b/g, '≤')
    .replace(/\\geq?\b/g, '≥')
    .replace(/\\infty\b/g, '∞')
    // Greek letters
    .replace(/\\theta\b/g, 'θ')
    .replace(/\\alpha\b/g, 'α')
    .replace(/\\beta\b/g, 'β')
    .replace(/\\gamma\b/g, 'γ')
    .replace(/\\Delta\b/g, 'Δ')
    .replace(/\\delta\b/g, 'δ')
    .replace(/\\lambda\b/g, 'λ')
    .replace(/\\mu\b/g, 'μ')
    .replace(/\\pi\b/g, 'π')
    .replace(/\\rho\b/g, 'ρ')
    .replace(/\\sigma\b/g, 'σ')
    .replace(/\\Omega\b/g, 'Ω')
    .replace(/\\omega\b/g, 'ω')
    // Degrees & units
    .replace(/\\degree\b/g, '°')
    .replace(/\^\\circ\b/g, '°')
    .replace(/\^\{\\circ\}/g, '°')
    // Fractions \frac{a}{b} -> (a / b) or a/b
    .replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, '($1 / $2)')
    .replace(/\\dfrac\{([^{}]+)\}\{([^{}]+)\}/g, '($1 / $2)')
    // Square roots \sqrt{a} -> √(a)
    .replace(/\\sqrt\{([^{}]+)\}/g, '√($1)')
    .replace(/\\sqrt\[3\]\{([^{}]+)\}/g, '∛($1)')
    // Common subscripts & superscripts
    .replace(/_0\b/g, '₀')
    .replace(/_1\b/g, '₁')
    .replace(/_2\b/g, '₂')
    .replace(/_3\b/g, '₃')
    .replace(/_4\b/g, '₄')
    .replace(/_x\b/g, 'ₓ')
    .replace(/_y\b/g, 'ᵧ')
    .replace(/\^2\b/g, '²')
    .replace(/\^3\b/g, '³')
    .replace(/\^4\b/g, '⁴')
    .replace(/\^0\b/g, '⁰')
    .replace(/\^1\b/g, '¹')
    .replace(/\^n\b/g, 'ⁿ')
    .replace(/\^\{-1\}/g, '⁻¹')
    .replace(/\^\{-2\}/g, '⁻²')
    .replace(/\^2/g, '²')
    .replace(/\^3/g, '³');

  // Strip LaTeX environment / text macros: \text{...} -> ...
  cleaned = cleaned.replace(/\\text\{([^{}]+)\}/g, '$1');
  cleaned = cleaned.replace(/\\mathrm\{([^{}]+)\}/g, '$1');
  cleaned = cleaned.replace(/\\mathbf\{([^{}]+)\}/g, '$1');

  // Remove $$...$$ block math wrappers
  cleaned = cleaned.replace(/\$\$([^\$]+)\$\$/g, '$1');

  // Remove $...$ inline math delimiters
  // We match $ followed by non-$ content ending with $
  cleaned = cleaned.replace(/\$([^\$]+)\$/g, '$1');

  // Clean up any stray dollar signs that were isolated before math terms (e.g. "$v =")
  cleaned = cleaned.replace(/\$([a-zA-Z0-9_\\^])/g, '$1');
  cleaned = cleaned.replace(/([a-zA-Z0-9_\\^])\$/g, '$1');

  // Clean double slashes or lingering backslashes
  cleaned = cleaned.replace(/\\\\/g, '\n');

  return cleaned.trim();
}
