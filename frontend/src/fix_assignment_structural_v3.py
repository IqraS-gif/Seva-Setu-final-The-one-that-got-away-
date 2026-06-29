import os

path = r'c:\Users\ZAHID\Downloads\SevaSetuversion1\SevaSetuversion1\SevaSetu\frontend\src\screens\volunteer\AssignmentScreen.tsx'

with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

# Fix middle-of-file identifier corruption
text = text.replace("show{t('assignments.filtersTitle')}", "showFilters")
text = text.replace("set{t('assignments.filtersTitle')}", "setFilters")
text = text.replace("setShow{t('assignments.filtersTitle')}", "setShowFilters")
text = text.replace("temp{t('assignments.filtersTitle')}", "tempFilters")
text = text.replace("setTemp{t('assignments.filtersTitle')}", "setTempFilters")

# Fix styles
text = text.replace("active{t('assignments.filtersTitle')}Row", "activeFiltersRow")
text = text.replace("clear{t('assignments.filtersTitle')}Btn", "clearFiltersBtn")
text = text.replace("clear{t('assignments.filtersTitle')}Text", "clearFiltersText")

with open(path, 'w', encoding='utf-8') as f:
    f.write(text)

print("Mid-file structural fixes complete")
