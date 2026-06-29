import re

file_path = r'c:\Users\ZAHID\Downloads\SevaSetuversion1\SevaSetuversion1\SevaSetu\frontend\src\screens\volunteer\ScanSurveyScreen.tsx'
with open(file_path, 'r', encoding='utf-8') as f:
    text = f.read()

# Fix 1: Filter logic and mappings using BilingualValue directly
# Line 997 -> reports.filter
text = text.replace(
    "r.primary_category === selectedCategory || r.auto_category === selectedCategory || r.issue_type === selectedCategory",
    "getBilingualText(r.primary_category, language) === selectedCategory || getBilingualText(r.auto_category, language) === selectedCategory || r.issue_type === selectedCategory"
)

# Fix 2: urgCfg and iColor
text = text.replace(
    "const urgCfg = getUrgencyConfig(r.urgency_level);",
    "const urgCfg = getUrgencyConfig(getBilingualText(r.urgency_level, language));"
)

text = text.replace(
    "const iColor = issueColor(r.primary_category || r.auto_category || r.issue_type);",
    "const catText = getBilingualText(r.primary_category, language) || getBilingualText(r.auto_category, language) || r.issue_type;\n            const iColor = issueColor(catText);"
)

# Fix 3: Rendering the pill texts
text = text.replace(
    "{r.primary_category || r.auto_category || r.issue_type || 'General'}",
    "{catText || 'General'}"
)

# Fix 4: Line 1139: mapping detailed_resolution_steps
# We missed detailed_resolution_steps in the first patch.
text = text.replace("displayedReport.detailed_resolution_steps && displayedReport.detailed_resolution_steps.length", "getBilingualArray(displayedReport.detailed_resolution_steps, language) && getBilingualArray(displayedReport.detailed_resolution_steps, language).length")
text = text.replace("displayedReport.detailed_resolution_steps.map((step: string,", "getBilingualArray(displayedReport.detailed_resolution_steps, language).map((step: string,")
text = text.replace("displayedReport.detailed_resolution_steps.map((step: string", "getBilingualArray(displayedReport.detailed_resolution_steps, language).map((step: string")

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(text)

print('ScanSurveyScreen type patch applied.')
