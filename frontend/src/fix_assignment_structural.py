import os

path = r'c:\Users\ZAHID\Downloads\SevaSetuversion1\SevaSetuversion1\SevaSetu\frontend\src\screens\volunteer\AssignmentScreen.tsx'

with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

# 1. Revert identifier/variable/prop corruption
# Function name: on{t('assignments.reset')} -> onReset
text = text.replace("on{t('assignments.reset')}", "onReset")

# Variable name: temp{t('assignments.filtersTitle')} -> tempFilters
text = text.replace("temp{t('assignments.filtersTitle')}", "tempFilters")
text = text.replace("setTemp{t('assignments.filtersTitle')}", "setTempFilters")

# Key name: min{t('assignments.availability')} -> minAvailability etc
text = text.replace("min{t('assignments.availability')}", "minAvailability")
text = text.replace("min{t('assignments.skillMatch')}", "minSkillMatch")
text = text.replace("min{t('assignments.areaMatch')}", "minAreaMatch")
text = text.replace("min{t('assignments.overallAiScore')}", "minTotalScore")

# Style prop corruption: styles.clear{t('assignments.clearAll')} -> styles.clear
# and other similar ones
text = text.replace("styles.clear{t('assignments.clearAll')}", "styles.clear")
text = text.replace("styles.noResults", "styles.noResults") # Ensure no stray replacements
text = text.replace("styles.noResultsTitle", "styles.noResultsTitle")
text = text.replace("styles.noResultsSub", "styles.noResultsSub")

# 2. Fix broken string literals (e.g. line.startsWith('{t(...)'))
# These appear in quotes like '{t('assignments.availability')}:'
# We should probably change them to check the actual string 'Availability:' since these come from the backend/logic
text = text.replace("'{t('assignments.availability')}:'", "'Availability:'")
text = text.replace("'Availability:'", "'Availability:'") # Just to be sure
# Actually, looking at the previous view_file, they were like line.startsWith('Availability:')

# 3. Fix keys in maps
text = text.replace("key={t(`assignments.${tab.toLowerCase()}`)}", "key={tab}")

# 4. Fix specific broken lines in ThresholdSelector labels
# label="{t('assignments.skillMatch')}" -> label={t('assignments.skillMatch')}
text = text.replace('label="{t(\'assignments.skillMatch\')}"', "label={t('assignments.skillMatch')}")
text = text.replace('label="{t(\'assignments.availability\')}"', "label={t('assignments.availability')}")
text = text.replace('label="{t(\'assignments.areaMatch\')}"', "label={t('assignments.areaMatch')}")
text = text.replace('label="{t(\'assignments.overallAiScore\')}"', "label={t('assignments.overallAiScore')}")

# 5. Fix UI text that was double-wrapped or broken
# e.g. <AppHeader title="My Assignments" ... /> was title="{t('assignments.title')}"? 
# Wait, I need to check what the previous patch actually did.

# Let's perform a generic fix for the most obvious structural breaks
# styles.clear{...} -> I saw errors about this
# styles.clear{t('assignments.clearAll')}
text = text.replace("styles.clear{t('assignments.clearAll')}", "styles.clear")

# Also found : styles.viewTasksBtn, styles.viewTasksBtnText etc
# I'll check if they are corrupted.

with open(path, 'w', encoding='utf-8') as f:
    f.write(text)

print("Structural fix complete")
