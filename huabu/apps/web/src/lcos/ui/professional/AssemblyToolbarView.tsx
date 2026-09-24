import { useId, useRef, useEffect } from 'react';

import { ASSEMBLY_FILTERS } from './assemblyPresentation';
import searchIcon from '../assets/search.svg';
import { LcosButton } from '../primitives/LcosButton';
import './professional-assembly.css';

import type { AssemblyMaterialFilter } from './assemblyPresentation';

export interface AssemblyToolbarViewProps {
  readonly query: string;
  readonly placeholder: string;
  readonly onQueryChange: (query: string) => void;
  readonly onSearch: () => void;
  readonly onClear: () => void;
  readonly filter: AssemblyMaterialFilter;
  readonly onFilterChange: (filter: AssemblyMaterialFilter) => void;
  readonly showFilters?: boolean;
  readonly localSearch?: boolean;
}
/** C01 search + P0-04 material filter. Native disclosure keeps focus/Escape inside this body. */
export function AssemblyToolbarView({ query, placeholder, onQueryChange, onSearch, onClear, filter,
  onFilterChange, showFilters = true, localSearch = false }: AssemblyToolbarViewProps): React.JSX.Element {
  const id = useId();
  const disclosure = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    const closeOutside = (event: PointerEvent): void => {
      if (disclosure.current?.open && event.target instanceof Node && !disclosure.current.contains(event.target)) { disclosure.current.open = false; }
    };
    document.addEventListener('pointerdown', closeOutside);
    return () => document.removeEventListener('pointerdown', closeOutside);
  }, []);
  return <div className="lcos-assembly-toolbar">
    <form role="search" aria-label={placeholder} onSubmit={(event) => { event.preventDefault(); onSearch(); }}>
      <label className="lcos-assembly-search-field" htmlFor={id}>
        <img src={searchIcon} alt="" width={18} height={18} />
        <input id={id} type="search" enterKeyHint="search" autoComplete="off" data-lcos-assembly-search value={query}
          onChange={(event) => onQueryChange(event.target.value)} placeholder={placeholder} aria-label={placeholder} />
      </label>
      {!localSearch ? <LcosButton appearance="oreo" variant="secondary" type="submit" className="lcos-assembly-search-submit">搜索</LcosButton> : null}
      {query !== '' ? <LcosButton appearance="oreo" variant="ghost" onClick={onClear} aria-label="清除搜索">清除</LcosButton> : null}
    </form>
    {showFilters ? <details ref={disclosure} className="lcos-assembly-filter" data-lcos-assembly-filter onKeyDownCapture={(event) => {
      if (event.key !== 'Escape' || !event.currentTarget.open) { return; }
      event.preventDefault(); event.stopPropagation(); event.currentTarget.open = false;
      event.currentTarget.querySelector('summary')?.focus();
    }}>
      <summary>筛选{filter === 'all' ? '' : ` · ${ASSEMBLY_FILTERS.find((entry) => entry.value === filter)?.label}`}</summary>
      <div className="lcos-assembly-filter-popover" role="group" aria-label="材料类型">
        <span>材料类型 <small>当前已读取内容</small></span>
        <div>{ASSEMBLY_FILTERS.map((entry) => <LcosButton appearance="oreo" key={entry.value} variant="secondary"
          aria-pressed={filter === entry.value} onClick={(event) => {
            onFilterChange(entry.value);
            const disclosure = event.currentTarget.closest('details');
            if (disclosure) { disclosure.open = false; disclosure.querySelector('summary')?.focus(); }
          }}>{entry.label}</LcosButton>)}</div>
      </div>
    </details> : null}
  </div>;
}
