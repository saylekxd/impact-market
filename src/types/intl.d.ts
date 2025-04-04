interface Segmenter {
  segment(input: string): Iterable<{ segment: string }>
}

declare namespace Intl {
  function Segmenter(
    locale?: string | string[],
    options?: { granularity?: "grapheme" | "word" | "sentence" }
  ): Segmenter
} 