
import os

def patch_assignment_screen():
    path = r'c:\Users\ZAHID\Downloads\SevaSetuversion1\SevaSetuversion1\SevaSetu\frontend\src\screens\volunteer\AssignmentScreen.tsx'
    if not os.path.exists(path):
        print(f"File not found: {path}")
        return

    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Fix the direct assignment rendering error
    target = '<View style={{ flexDirection: \'row\', alignItems: \'center\' }}><Feather name="map-pin" size={11} color={colors.textSecondary} /> <DynamicText style={styles.eventArea} text={data.volunteer_area || data.area} /></View>'
    # We use a more flexible replacement in case of slight spacing differences
    new_content = """<View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Feather name="map-pin" size={11} color={colors.textSecondary} style={{ marginRight: 4 }} />
                  <DynamicText style={styles.eventArea} text={data.volunteer_area || data.area} />
                </View>"""
    
    if target in content:
        content = content.replace(target, new_content)
        print("Patched rendering error.")
    else:
        # Try a more fuzzy match
        print("Target for rendering error not found exactly. Searching fuzzy...")
        import re
        content, count = re.subn(r'<View style=\{\{ flexDirection: \'row\', alignItems: \'center\' \}\}>\s*<Feather name="map-pin" size=\{11\} color=\{colors\.textSecondary\} />\s*<DynamicText style=\{styles\.eventArea\} text=\{data\.volunteer_area \|\| data\.area\} />\s*</View>', new_content, content)
        if count > 0:
            print(f"Patched {count} fuzzy rendering errors.")

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

def patch_dictionaries():
    for lang in ['hi', 'en']:
        path = fr'c:\Users\ZAHID\Downloads\SevaSetuversion1\SevaSetuversion1\SevaSetu\frontend\src\i18n\{lang}.ts'
        if not os.path.exists(path):
            print(f"File not found: {path}")
            continue

        with open(path, 'r', encoding='utf-8') as f:
            lines = f.readlines()

        new_lines = []
        found_view = False
        for line in lines:
            new_lines.append(line)
            if 'viewAiReasoning:' in line and not found_view:
                # Add the new keys after viewAiReasoning
                indent = line[:line.find('viewAiReasoning')]
                if lang == 'hi':
                    new_lines.append(f"{indent}fatigue_buffer: 'थकान बफर',\n")
                    new_lines.append(f"{indent}overall: 'कुल स्कोर',\n")
                else:
                    new_lines.append(f"{indent}fatigue_buffer: 'Fatigue Buffer',\n")
                    new_lines.append(f"{indent}overall: 'Overall Score',\n")
                # We don't set found_view = True here if we want to catch all occurrences (since there are two blocks)

        with open(path, 'w', encoding='utf-8') as f:
            f.writelines(new_lines)
        print(f"Patched {lang}.ts")

if __name__ == "__main__":
    patch_assignment_screen()
    patch_dictionaries()
