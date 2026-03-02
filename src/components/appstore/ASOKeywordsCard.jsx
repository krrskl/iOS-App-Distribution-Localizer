import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Sparkles, CheckCircle2, AlertCircle, Loader2, ChevronDown, Search, TrendingUp, Edit3, Plus, X, ArrowUpDown } from 'lucide-react'
import { ASC_LOCALES } from '@/services/appStoreConnectService'

export default function ASOKeywordsCard({
  versionLocalizations,
  generatingKeywordsFor,
  asoExpandedLocales,
  editingKeywordsFor,
  editedKeywords,
  setEditedKeywords,
  isSavingKeywords,
  currentAiApiKey,
  astroEnabled,
  astroSuggestions,
  onAstroSuggestionsClose,
  onApplyAstroSuggestions,
  handleGenerateASOKeywords,
  toggleAsoLocale,
  startEditingKeywords,
  cancelEditingKeywords,
  saveEditedKeywords,
}) {
  return (
  <>
    <Card id="asc-aso-keywords" className="border-border/50 shadow-sm scroll-mt-6">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 shadow-lg">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-lg">ASO Keywords</CardTitle>
            <CardDescription className="flex items-center gap-2">
              Optimize keywords for each locale
              {astroEnabled ? (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 bg-orange-500/10 text-orange-500 border-0">Astro</Badge>
              ) : (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 bg-primary/10 text-primary border-0">AI</Badge>
              )}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/20">
          <Search className="h-5 w-5 text-orange-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-foreground">Smart Keyword Generation</p>
            <p className="text-xs text-muted-foreground mt-1">
              Generate optimized, country-specific keywords based on your app description.
              Keywords are tailored for each market, not just translated.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          {versionLocalizations.map(loc => {
            const localeInfo = ASC_LOCALES.find(l => l.code === loc.locale)
            const isExpanded = asoExpandedLocales.includes(loc.locale)
            const isGenerating = generatingKeywordsFor === loc.locale
            const keywordCount = loc.keywords ? loc.keywords.split(',').length : 0
            const charCount = loc.keywords?.length || 0

            return (
              <div
                key={loc.id}
                className="rounded-xl border border-border/50 overflow-hidden transition-all duration-200 hover:border-border"
              >
                <div
                  className="flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => toggleAsoLocale(loc.locale)}
                >
                  <span className="text-xl">{localeInfo?.flag || '🌐'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{localeInfo?.name || loc.locale}</span>
                      {loc.keywords ? (
                        <Badge variant="outline" className="text-xs">
                          {keywordCount} keywords
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs text-muted-foreground">
                          No keywords
                        </Badge>
                      )}
                    </div>
                    {loc.keywords && (
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        {loc.keywords}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {loc.keywords && (
                      <span className={`text-xs font-mono ${charCount > 90 ? 'text-amber-500' : 'text-muted-foreground'}`}>
                        {charCount}/100
                      </span>
                    )}
                    <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-4 pb-4 pt-2 border-t border-border/50 bg-muted/20">
                    <div className="space-y-3">
                      {editingKeywordsFor === loc.locale ? (
                        <div className="space-y-3">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label className="text-xs font-medium text-muted-foreground">Edit Keywords</Label>
                              <span className={`text-xs font-mono ${editedKeywords.length > 90 ? 'text-amber-500' : editedKeywords.length > 100 ? 'text-red-500' : 'text-muted-foreground'}`}>
                                {editedKeywords.length}/100
                              </span>
                            </div>
                            <Textarea
                              value={editedKeywords}
                              onChange={(e) => setEditedKeywords(e.target.value)}
                              placeholder="keyword1,keyword2,keyword3"
                              className="min-h-[80px] text-sm font-mono resize-none"
                              maxLength={100}
                              onClick={(e) => e.stopPropagation()}
                            />
                            <p className="text-xs text-muted-foreground">
                              Separate keywords with commas. No spaces after commas.
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={(e) => {
                                e.stopPropagation()
                                saveEditedKeywords(loc.locale)
                              }}
                              disabled={isSavingKeywords || editedKeywords.length > 100}
                              size="sm"
                              className="flex-1 h-9"
                            >
                              {isSavingKeywords ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Saving...
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="h-4 w-4 mr-2" />
                                  Save Keywords
                                </>
                              )}
                            </Button>
                            <Button
                              onClick={(e) => {
                                e.stopPropagation()
                                cancelEditingKeywords()
                              }}
                              variant="outline"
                              size="sm"
                              className="h-9"
                              disabled={isSavingKeywords}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-xs font-medium text-muted-foreground">Current Keywords</Label>
                            <Button
                              onClick={(e) => {
                                e.stopPropagation()
                                startEditingKeywords(loc.locale, loc.keywords)
                              }}
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-xs"
                            >
                              <Edit3 className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                          </div>
                          {loc.keywords ? (
                            <div
                              className="flex flex-wrap gap-1.5 p-3 rounded-lg bg-background/50 border border-border/30 cursor-pointer hover:border-primary/30 transition-colors"
                              onClick={(e) => {
                                e.stopPropagation()
                                startEditingKeywords(loc.locale, loc.keywords)
                              }}
                            >
                              {loc.keywords.split(',').map((keyword, idx) => (
                                <span
                                  key={idx}
                                  className="px-2.5 py-1 rounded-lg bg-background border border-border/50 text-xs font-medium hover:border-primary/50 hover:bg-primary/5 transition-colors"
                                >
                                  {keyword.trim()}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <div
                              className="p-4 rounded-lg bg-background/50 border border-dashed border-border/50 cursor-pointer hover:border-primary/30 transition-colors text-center"
                              onClick={(e) => {
                                e.stopPropagation()
                                startEditingKeywords(loc.locale, '')
                              }}
                            >
                              <p className="text-sm text-muted-foreground">No keywords set</p>
                              <p className="text-xs text-muted-foreground/70 mt-1">Click to add keywords</p>
                            </div>
                          )}
                        </div>
                      )}

                      {editingKeywordsFor !== loc.locale && (
                        <>
                          <div className="flex gap-2 w-full">
                            {astroEnabled && (
                              <Button
                                onClick={(e) => { e.stopPropagation(); handleGenerateASOKeywords(loc.locale, 'astro') }}
                                disabled={isGenerating}
                                variant="outline"
                                size="sm"
                                className="flex-1 h-9"
                              >
                                {isGenerating ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <TrendingUp className="h-3.5 w-3.5 mr-1.5" />}
                                Astro
                              </Button>
                            )}
                            <Button
                              onClick={(e) => { e.stopPropagation(); handleGenerateASOKeywords(loc.locale, 'ai') }}
                              disabled={isGenerating || !currentAiApiKey}
                              variant="outline"
                              size="sm"
                              className={astroEnabled ? 'flex-1 h-9' : 'w-full h-9'}
                            >
                              {isGenerating && !astroEnabled ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <Sparkles className="h-3.5 w-3.5 mr-1.5" />}
                              AI Generate
                            </Button>
                          </div>

                          {!currentAiApiKey && !astroEnabled && (
                            <p className="text-xs text-amber-500 flex items-center gap-1">
                              <AlertCircle className="h-3 w-3" />
                              Configure AI API key in sidebar or enable Astro
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

      </CardContent>
    </Card>

    <AstroSuggestionsDialog
      astroSuggestions={astroSuggestions}
      onClose={onAstroSuggestionsClose}
      onApply={onApplyAstroSuggestions}
      isSaving={isSavingKeywords}
    />
  </>
  )
}

function AstroSuggestionsDialog({ astroSuggestions, onClose, onApply, isSaving }) {
  const [selected, setSelected] = useState(new Set())
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('popularity')
  const [sortDir, setSortDir] = useState('desc')

  const suggestions = astroSuggestions?.suggestions || []
  const currentKeywords = astroSuggestions?.currentKeywords || ''

  const previewKeywords = useMemo(() => {
    if (!astroSuggestions) return ''
    const existing = currentKeywords ? currentKeywords.split(',').map(k => k.trim()).filter(Boolean) : []
    const merged = [...existing]
    for (const kw of suggestions.filter(s => selected.has(s.keyword)).map(s => s.keyword)) {
      if (!merged.some(m => m.toLowerCase() === kw.toLowerCase())) merged.push(kw)
    }
    return merged.join(',')
  }, [astroSuggestions, currentKeywords, selected, suggestions])

  const charsUsed = previewKeywords.length
  const charsLeft = 100 - charsUsed

  const wouldFit = (keyword) => {
    if (selected.has(keyword)) return true
    const cost = previewKeywords.length === 0 ? keyword.length : keyword.length + 1
    return charsUsed + cost <= 100
  }

  const filtered = useMemo(() => {
    let items = [...suggestions]
    if (search) {
      const q = search.toLowerCase()
      items = items.filter(s => s.keyword.toLowerCase().includes(q))
    }
    items.sort((a, b) => {
      const av = a[sortBy] ?? 0
      const bv = b[sortBy] ?? 0
      return sortDir === 'desc' ? bv - av : av - bv
    })
    return items
  }, [suggestions, search, sortBy, sortDir])

  const toggleKeyword = (keyword) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(keyword)) next.delete(keyword)
      else if (wouldFit(keyword)) next.add(keyword)
      return next
    })
  }

  const handleSort = (col) => {
    if (sortBy === col) setSortDir(d => d === 'desc' ? 'asc' : 'desc')
    else { setSortBy(col); setSortDir('desc') }
  }

  const sortArrow = (col) => {
    if (sortBy !== col) return <ArrowUpDown className="h-3 w-3 opacity-30" />
    return <ChevronDown className={`h-3 w-3 ${sortDir === 'asc' ? 'rotate-180' : ''}`} />
  }

  const popColor = (v) => v >= 50 ? 'text-emerald-500' : v >= 20 ? 'text-amber-500' : 'text-muted-foreground'
  const diffColor = (v) => v <= 20 ? 'text-emerald-500' : v <= 50 ? 'text-amber-500' : 'text-red-500'

  if (!astroSuggestions) return null

  const selectedKeywords = suggestions.filter(s => selected.has(s.keyword)).map(s => s.keyword)

  return (
    <Dialog open={!!astroSuggestions} onOpenChange={(open) => { if (!open) { setSelected(new Set()); setSearch(''); onClose() } }}>
      <DialogContent className="sm:max-w-[700px] gap-0 p-0 overflow-hidden">
        <DialogHeader className="p-5 pb-4 border-b border-border/50 bg-gradient-to-r from-orange-500/5 to-amber-500/5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-500">
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
            <div>
              <DialogTitle className="text-base">Astro Suggestions</DialogTitle>
              <DialogDescription className="text-xs">{astroSuggestions.localeName} — {suggestions.length} keywords</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="px-5 pt-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">Capacity</span>
            <div className="w-32 h-2 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${charsLeft < 0 ? 'bg-red-500' : charsLeft < 15 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                style={{ width: `${Math.min(100, (charsUsed / 100) * 100)}%` }}
              />
            </div>
          </div>
          <div className={`flex items-baseline gap-1 ${charsLeft < 0 ? 'text-red-500' : charsLeft < 15 ? 'text-amber-500' : 'text-muted-foreground'}`}>
            <span className="text-xl font-bold tabular-nums">{charsLeft}</span>
            <span className="text-xs">chars left</span>
          </div>
        </div>

        <div className="px-5 pt-3 pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Filter keywords..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-8 pl-9 pr-3 text-sm rounded-lg border border-border/50 bg-background focus:outline-none focus:ring-1 focus:ring-orange-500/50"
            />
          </div>
        </div>

        <div className="overflow-y-auto max-h-[50vh] px-5">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-background z-10">
              <tr className="border-b border-border/50">
                <th className="w-8 py-2 text-left" />
                <th className="py-2 text-left font-medium text-muted-foreground text-xs">Keyword</th>
                {[['popularity', 'Pop'], ['difficulty', 'Diff'], ['appsCount', 'Apps']].map(([col, label]) => (
                  <th key={col} className="py-2 text-right w-14">
                    <button onClick={() => handleSort(col)} className="inline-flex items-center gap-0.5 font-medium text-muted-foreground text-xs hover:text-foreground ml-auto">
                      {label} {sortArrow(col)}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => {
                const isSelected = selected.has(s.keyword)
                const fits = wouldFit(s.keyword)
                const disabled = s.existing || (!isSelected && !fits)
                return (
                  <tr
                    key={s.keyword}
                    onClick={() => !disabled && toggleKeyword(s.keyword)}
                    className={`border-b border-border/30 ${
                      disabled ? 'opacity-35 cursor-default' :
                      isSelected ? 'bg-orange-500/5 cursor-pointer' : 'hover:bg-muted/30 cursor-pointer'
                    }`}
                  >
                    <td className="py-1.5">
                      <div className={`flex h-4 w-4 items-center justify-center rounded border-2 ${
                        s.existing ? 'bg-muted border-muted-foreground/20' :
                        isSelected ? 'bg-orange-500 border-orange-500' : 'border-muted-foreground/30'
                      }`}>
                        {(isSelected || s.existing) && (
                          <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </td>
                    <td className="py-1.5">
                      <span className="font-medium">{s.keyword}</span>
                      {s.existing && <span className="ml-1.5 text-[10px] text-muted-foreground">(added)</span>}
                      {!s.existing && !fits && !isSelected && <span className="ml-1.5 text-[10px] text-red-400">won't fit</span>}
                    </td>
                    <td className={`py-1.5 text-right tabular-nums font-medium ${s.popularity != null ? popColor(s.popularity) : 'text-muted-foreground'}`}>
                      {s.popularity ?? '—'}
                    </td>
                    <td className={`py-1.5 text-right tabular-nums font-medium ${s.difficulty != null ? diffColor(s.difficulty) : 'text-muted-foreground'}`}>
                      {s.difficulty ?? '—'}
                    </td>
                    <td className="py-1.5 text-right tabular-nums text-muted-foreground">
                      {s.appsCount ?? '—'}
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="py-8 text-center text-sm text-muted-foreground">No match</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3 border-t border-border/50 space-y-2">
          <div className={`text-xs rounded-lg px-3 py-2 break-all border font-mono ${
            charsLeft < 0 ? 'bg-red-500/10 border-red-500/30' : 'bg-muted/30 border-border/50'
          }`}>
            {previewKeywords || <span className="text-muted-foreground italic">No keywords yet</span>}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{selected.size} selected — {charsUsed}/100 chars</span>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => { setSelected(new Set()); setSearch(''); onClose() }}>
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => { onApply(selectedKeywords); setSelected(new Set()); setSearch('') }}
                disabled={selected.size === 0 || isSaving}
                className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 border-0"
              >
                {isSaving ? (
                  <><Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />Saving...</>
                ) : (
                  <>Apply Keywords</>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
