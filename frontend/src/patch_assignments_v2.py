import os

path = r'c:\Users\ZAHID\Downloads\SevaSetuversion1\SevaSetuversion1\SevaSetu\frontend\src\screens\volunteer\AssignmentScreen.tsx'

with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

# Tab labels
text = text.replace("{tab}", "{t(`assignments.${tab.toLowerCase()}`)}")

# Screen content
text = text.replace("Loading assignments…", "{t('assignments.loading')}")
text = text.replace("No Pending Missions", "{t('assignments.noPendingMissions')}")
text = text.replace("There are no live events matching your profile at the moment.", "{t('assignments.noPendingSubtitle')}")
text = text.replace("Update your skills or check back when a supervisor dispatches a new mission.", "")

text = text.replace("No Accepted Assignments", "{t('assignments.noAcceptedAssignments')}")
text = text.replace("Missions you accept will appear here.", "{t('assignments.noAcceptedSubtitle')}")

text = text.replace("No Past Assignments", "{t('assignments.noPastAssignments')}")
text = text.replace("Your declined assignment history will appear here.", "{t('assignments.noPastSubtitle')}")

# Match labels
text = text.replace("'Excellent Match'", "t('assignments.excellentMatch')")
text = text.replace("'Good Match'", "t('assignments.goodMatch')")
text = text.replace("'Partial Match'", "t('assignments.partialMatch')")

# Reasoning modal fallback text
text = text.replace("Full AI justification will appear once the mission details are re-verified by the dispatcher.", "{t('assignments.aiReasoningSub')}")
text = text.replace("🤖 AI Match Reasoning", "{t('assignments.aiReasoningTitle')}")
text = text.replace("Got it", "{t('assignments.gotIt')}")

# Filter modal
text = text.replace("Apply Filters", "{t('assignments.applyFilters')}")
text = text.replace("Reset", "{t('assignments.reset')}")
text = text.replace("Filters", "{t('assignments.filtersTitle')}")
text = text.replace("Minimum Thresholds", "{t('assignments.minThresholds')}")
text = text.replace("Skill Match", "{t('assignments.skillMatch')}")
text = text.replace("Availability", "{t('assignments.availability')}")
text = text.replace("Area Match", "{t('assignments.areaMatch')}")
text = text.replace("Overall AI Score", "{t('assignments.overallAiScore')}")
text = text.replace("'Any'", "t('assignments.any')")
text = text.replace("Filter by Required Skills", "{t('assignments.filterBySkills')}")

# Mission Card buttons & labels
text = text.replace("🎯 DIRECT ASSIGNMENT", "{t('assignments.directAssignment')}")
text = text.replace("The supervisor has specifically selected you for this mission based on your profile.", "{t('assignments.directDesc')}")
text = text.replace("Your Matching Skills", "{t('assignments.matchingSkills')}")
text = text.replace("General Volunteer Required", "{t('assignments.generalVolunteer')}")
text = text.replace("'Accept Mission'", "t('assignments.accept')")
text = text.replace("'Join Mission'", "t('assignments.join')")

# History card labels
text = text.replace("'✅ Accepted'", "t('assignments.acceptedLabel')")
text = text.replace("'❌ Declined'", "t('assignments.declinedLabel')")
text = text.replace("'Area TBD'", "t('assignments.areaTbd')")

# Plural logic for mission count
text = text.replace("{pendingCount} mission{pendingCount !== 1 ? 's' : ''} shown", 
                    "{pendingCount} {pendingCount === 1 ? t('assignments.missionShown') : t('assignments.missionsShown')}")

# Result states
text = text.replace("No results for these filters", "{t('assignments.noResults')}")
text = text.replace("Try relaxing your thresholds or selecting fewer skills.", "{t('assignments.tryRelaxing')}")
text = text.replace("Reset All Filters", "{t('assignments.resetFilters')}")
text = text.replace("Clear All", "{t('assignments.clearAll')}")

with open(path, 'w', encoding='utf-8') as f:
    f.write(text)

print("AssignmentScreen patched successfully")
