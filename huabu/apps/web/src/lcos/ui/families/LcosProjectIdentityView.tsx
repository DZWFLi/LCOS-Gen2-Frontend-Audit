// Figma 5386:212。链接及导航回调仍由 Shell 持有，View 不读 route/store。
import { FigmaShellGlyph } from '../FigmaShellGlyph';

export function LcosProjectIdentityView({ name }: { readonly name: string }): React.JSX.Element {
  return <span data-lcos-project-identity-content>
    <FigmaShellGlyph name="project" size={18} />
    <span data-lcos-project-identity-label>{name}</span>
  </span>;
}
