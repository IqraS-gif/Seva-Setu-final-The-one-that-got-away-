import os

path = r'c:\Users\ZAHID\Downloads\SevaSetuversion1\SevaSetuversion1\SevaSetu\frontend\src\screens\volunteer\AssignmentScreen.tsx'

with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

# Fix styles key corruption
text = text.replace("active{t('assignments.filtersTitle')}Row", "activeFiltersRow")
text = text.replace("clear{t('assignments.filtersTitle')}Btn", "clearFiltersBtn")
text = text.replace("clear{t('assignments.filtersTitle')}Text", "clearFiltersText")

# Fix matching threshold usage in components if any
# e.g. temp{t('assignments.filtersTitle')} usage
text = text.replace("temp{t('assignments.filtersTitle')}", "tempFilters")
text = text.replace("setTemp{t('assignments.filtersTitle')}", "setTempFilters")

# Fix starting with quotes
text = text.replace("'{t('assignments.availability')}:'", "'Availability:'")

with open(path, 'w', encoding='utf-8') as f:
    f.write(text)

print("Additional structural fixes complete")
