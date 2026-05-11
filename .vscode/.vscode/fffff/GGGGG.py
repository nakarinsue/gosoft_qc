import os
import zipfile

# Project structure
project_name = "data40-suite"
structure = {
    "src": {
        "components": [
            "ConfigAPI.vue",
            "ConfigDB.vue",
            "InfoPanel.vue",
            "HeaderPanel.vue",
            "FooterLog.vue",
            "ActionTabs.vue",
            "DataForm.vue",
            "DataTable.vue"
        ],
        "composables": ["useFormValidation.ts"],
        "stores": ["mainStore.ts"],
        "schema": ["fieldsSchema.ts"],
        "App.vue": None,
        "main.ts": None,
        "style.css": None
    },
    "public": [],
    "package.json": None,
    "vite.config.ts": None,
    "tsconfig.json": None,
    "README.md": None
}

# Helper to create files and folders
def create_structure(base, struct):
    for key, value in struct.items():
        path = os.path.join(base, key)
        if isinstance(value, dict):
            os.makedirs(path, exist_ok=True)
            create_structure(path, value)
        elif isinstance(value, list):
            os.makedirs(path, exist_ok=True)
            for f in value:
                open(os.path.join(path, f), "w").close()
        else:
            open(path, "w").close()

# Create project structure
os.makedirs(project_name, exist_ok=True)
create_structure(project_name, structure)

# Create zip
zip_name = f"{project_name}.zip"
with zipfile.ZipFile(zip_name, 'w', zipfile.ZIP_DEFLATED) as zipf:
    for root, dirs, files in os.walk(project_name):
        for file in files:
            zipf.write(os.path.join(root, file),
                       os.path.relpath(os.path.join(root, file), project_name))

print(f"Project zip created: {zip_name}")
print("คำสั่งติดตั้งและรันโปรเจกต์ Vue 3:")
print(f"""
cd {project_name}
# ติดตั้ง pnpm ถ้ายังไม่มี
npm install -g pnpm

# ติดตั้ง dependencies
pnpm install

# รันโปรเจกต์ในโหมด dev
pnpm dev

# build production
pnpm build
""")
