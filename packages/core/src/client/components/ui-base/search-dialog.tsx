import { useEffect, useCallback } from 'react'
import { useSearch } from '@hooks/use-search'
import {
  SearchDialogAutocomplete,
  SearchDialogInput,
  SearchDialogItemBio,
  SearchDialogItemIcon,
  SearchDialogItemRoot,
  SearchDialogItemTitle,
  SearchDialogList,
  SearchDialogRoot,
} from '@components/primitives/search-dialog'
import Navbar from '@components/primitives/navbar'
import { useNavigate } from 'react-router-dom'
import type { ComponentRoute } from '@client/types'
interface SearchResult {
  id: string
  title: string
  path: string
  bio: string
  groupTitle?: string
  isHeading?: boolean
}

export function SearchDialog({ routes }: { routes: ComponentRoute[] }) {
  const { isOpen, setIsOpen, query, setQuery, list } = useSearch(routes)
  const navigate = useNavigate()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = /Mac/.test(navigator.userAgent)
      const isMeta = isMac ? e.metaKey : e.ctrlKey

      if (isMeta && (e.key === 'k' || e.key === 'j')) {
        e.preventDefault()
        setIsOpen((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [setIsOpen])

  const handleSelect = useCallback(
    (key: React.Key) => {
      const path = String(key)
      setIsOpen(false)

      if (path.includes('#')) {
        const [p, id] = path.split('#')
        navigate(p)
        setTimeout(() => {
          const el = document.getElementById(id)
          if (el) el.scrollIntoView({ behavior: 'smooth' })
        }, 100)
      } else {
        navigate(path)
      }
    },
    [navigate, setIsOpen],
  )

  return (
    <>
      <Navbar.SearchTrigger onPress={() => setIsOpen(true)} />

      <SearchDialogRoot isOpen={isOpen} onOpenChange={setIsOpen}>
        <SearchDialogAutocomplete onSelectionChange={handleSelect}>
          <SearchDialogInput
            value={query}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setQuery(e.target.value)
            }
          />
          <SearchDialogList items={list as SearchResult[]}>
            {(item: SearchResult) => (
              <SearchDialogItemRoot
                key={item.id}
                onPress={() => handleSelect(item.id)}
                textValue={item.title}
              >
                <SearchDialogItemIcon isHeading={item.isHeading} />
                <div className="flex flex-col justify-center gap-0.5">
                  <SearchDialogItemTitle>{item.title}</SearchDialogItemTitle>
                  <SearchDialogItemBio>{item.bio}</SearchDialogItemBio>
                </div>
              </SearchDialogItemRoot>
            )}
          </SearchDialogList>
        </SearchDialogAutocomplete>
      </SearchDialogRoot>
    </>
  )
}
