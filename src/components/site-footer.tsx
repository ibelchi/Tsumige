export function SiteFooter() {
  return (
    <footer aria-label="Peu de pàgina" className="mt-auto border-t px-5 py-6 sm:px-8 lg:px-10">
      <div className="text-center">
        <p className="text-xs leading-6 text-muted-foreground">
          Textos i notes<br />
          <a
            href="https://creativecommons.org/licenses/by-nc-sa/4.0/deed.ca"
            rel="license noopener noreferrer"
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-sm font-medium text-foreground underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-ring"
            title="Els textos i notes propis es comparteixen amb CC BY-NC-SA 4.0. Se n’exclouen el logo, el codi i les portades i altres materials de tercers."
          >
            <span aria-hidden="true" className="inline-flex size-5 items-center justify-center rounded-full border border-current text-[10px] font-bold">CC</span>
            CC BY-NC-SA 4.0
          </a>
        </p>
        <p className="mt-3 text-xs leading-6 text-muted-foreground">Observar per crear i enfilar per gaudir. Repetir.</p>
      </div>
    </footer>
  )
}
