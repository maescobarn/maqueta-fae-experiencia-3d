import type {ReactNode} from 'react';
export default function ComparisonScroll({children}:{children:ReactNode}){
 // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- The overflowing table must be focusable for keyboard scrolling on narrow viewports.
 return <section className="comparison-scroll" aria-label="Comparación de duración, acreditación y aranceles" tabIndex={0}>{children}</section>;
}
