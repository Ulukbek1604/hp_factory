import os
import glob

def find_and_replace():
    # Find all path names
    files = []
    files.extend(glob.glob('**/*.py', recursive=True))
    files.extend(glob.glob('**/*.html', recursive=True))

    for filepath in files:
        # Ignore virtual env if any
        if 'venv' in filepath or '.venv' in filepath or 'env' in filepath:
            continue
            
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()

            # Replace occurrences
            new_content = content.replace('₸', 'сом').replace('тнг', 'сом')

            if new_content != content:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f"Updated: {filepath}")
        except Exception as e:
            print(f"Error reading {filepath}: {e}")

if __name__ == '__main__':
    find_and_replace()

