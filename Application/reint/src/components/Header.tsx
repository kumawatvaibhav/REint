import { link } from 'fs'
import Link from 'next/link'

const PROFILE_LINKS = {
    github: 'https://github.com/kumawatvaibhav/REint',
    leetcode: 'https://leetcode.com/u/Vaibhav743/',
    resume: 'https://drive.google.com/file/d/1WF37PfWkswr2IrD_ZppkepQ75tt0VwZ3/view?usp=sharing',
    linkedin: 'https://www.linkedin.com/in/vaibhav-kumawatt',
}

export function Header() {
    return (
        <header className="sticky top-0 z-30 border-b border-[var(--line-soft)] bg-white/72 backdrop-blur-md">
            <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-3 md:px-8 md:py-4">
                <Link href="/" className="group inline-flex items-center" aria-label="Go to homepage">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--line-soft)] bg-[linear-gradient(150deg,rgba(255,122,50,0.2),rgba(15,123,159,0.14))] text-sm font-bold tracking-[0.12em] text-[var(--ink-900)]">
                        VK
                    </span>
                </Link>

                <div className="flex flex-wrap items-center justify-end gap-2">
                    <a
                        href={PROFILE_LINKS.github}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--line-soft)] bg-white/85 text-[var(--ink-700)] transition hover:bg-white hover:text-[var(--ink-900)]"
                        aria-label="Open GitHub profile"
                        title="GitHub profile"
                    >
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
                            <path d="M12 .5a12 12 0 0 0-3.79 23.39c.6.12.82-.26.82-.58v-2.02c-3.34.73-4.05-1.61-4.05-1.61a3.2 3.2 0 0 0-1.35-1.77c-1.1-.76.08-.74.08-.74a2.53 2.53 0 0 1 1.84 1.24 2.56 2.56 0 0 0 3.49 1 2.56 2.56 0 0 1 .77-1.61c-2.67-.3-5.47-1.33-5.47-5.94a4.64 4.64 0 0 1 1.24-3.22 4.3 4.3 0 0 1 .12-3.18s1-.32 3.3 1.23a11.3 11.3 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23a4.3 4.3 0 0 1 .12 3.18 4.64 4.64 0 0 1 1.24 3.22c0 4.62-2.8 5.64-5.48 5.93a2.86 2.86 0 0 1 .82 2.22v3.29c0 .32.21.7.82.58A12 12 0 0 0 12 .5Z" />
                        </svg>
                    </a>

                    <a
                        href={PROFILE_LINKS.leetcode}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--line-soft)] bg-white/85 text-[var(--ink-700)] transition hover:bg-white hover:text-[var(--ink-900)]"
                        aria-label="Open LeetCode profile"
                        title="LeetCode profile"
                    >
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="#FFA116" aria-hidden>
                            <path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .066-.523 2.545 2.545 0 0 1 .619-1.164L9.13 8.114c1.058-1.134 3.204-1.27 4.43-.278l3.501 2.831c.593.48 1.461.387 1.94-.207a1.384 1.384 0 0 0-.207-1.943l-3.5-2.831c-.8-.647-1.766-1.045-2.774-1.202l2.015-2.158A1.384 1.384 0 0 0 13.483 0zm-2.866 12.815a1.38 1.38 0 0 0-1.38 1.382 1.38 1.38 0 0 0 1.38 1.382H20.79a1.38 1.38 0 0 0 1.38-1.382 1.38 1.38 0 0 0-1.38-1.382z" />
                        </svg>
                    </a>

                    <a
                        href={PROFILE_LINKS.linkedin}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--line-soft)] bg-white/85 text-[var(--ink-700)] transition hover:bg-white hover:text-[var(--ink-900)]"
                        aria-label="Open LinkedIn profile"
                        title="LinkedIn profile"
                    >
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                        </svg>
                    </a>

                    <a
                        href={PROFILE_LINKS.resume}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--line-soft)] bg-white/85 text-[var(--ink-700)] transition hover:bg-white hover:text-[var(--ink-900)]"
                        aria-label="Open resume"
                        title="Resume"
                    >
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
                            <polyline points="14 2 14 8 20 8" />
                            <line x1="9" y1="13" x2="15" y2="13" />
                            <line x1="9" y1="17" x2="15" y2="17" />
                            <line x1="9" y1="9" x2="11" y2="9" />
                        </svg>
                    </a>
                </div>
            </div>
        </header>
    )
}