import json
from pathlib import Path
import xmltodict

def get_xml_files_recursive(path: Path) -> list[Path]:
    """Recursively get all XML files from path and subdirectories"""
    return list(path.rglob("*.xml"))

def xml_to_json(xml_file: Path) -> dict:
    with open(xml_file, "r") as f:
        xml_content = f.read()
        data_dict = xmltodict.parse(xml_content, attr_prefix='', cdata_key='Value')
    return data_dict

def save_json(json_data: dict, path: Path):
    # Ensure the directory exists
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w") as f:
        json.dump(json_data, f, indent=4)

def main():
    xml_data_path = Path("xml-data")
    data_path = Path("data")
    
    # Get all XML files recursively
    xml_files = get_xml_files_recursive(xml_data_path)
    
    for xml_file in xml_files:
        # Calculate the relative path from xml-data
        relative_path = xml_file.relative_to(xml_data_path)
        
        # Create the corresponding JSON file path in data directory
        json_file_path = data_path / relative_path.with_suffix(".json")
        
        # Convert and save
        data_dict = xml_to_json(xml_file)
        save_json(data_dict, json_file_path)
        print(f"Converted: {xml_file} -> {json_file_path}")

if __name__ == "__main__":
    main()