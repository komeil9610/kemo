#!/usr/bin/env python3
import json
import re
import sys
import zipfile
from pathlib import Path
from xml.etree import ElementTree as ET

NS_MAIN = "http://schemas.openxmlformats.org/spreadsheetml/2006/main"
NS_REL = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
NS_PKG_REL = "http://schemas.openxmlformats.org/package/2006/relationships"


def q(namespace, tag):
    return f"{{{namespace}}}{tag}"


def read_shared_strings(archive):
    if "xl/sharedStrings.xml" not in archive.namelist():
        return []

    root = ET.fromstring(archive.read("xl/sharedStrings.xml"))
    values = []
    for item in root.findall(q(NS_MAIN, "si")):
        texts = []
        for text_node in item.iterfind(f".//{q(NS_MAIN, 't')}"):
            texts.append(text_node.text or "")
        values.append("".join(texts))
    return values


def read_sheet_targets(archive):
    workbook = ET.fromstring(archive.read("xl/workbook.xml"))
    rels = ET.fromstring(archive.read("xl/_rels/workbook.xml.rels"))
    rel_map = {
        rel.attrib.get("Id"): rel.attrib.get("Target", "")
        for rel in rels.findall(q(NS_PKG_REL, "Relationship"))
    }

    sheets = []
    sheets_root = workbook.find(q(NS_MAIN, "sheets"))
    if sheets_root is None:
        return sheets

    for sheet in sheets_root.findall(q(NS_MAIN, "sheet")):
        rel_id = sheet.attrib.get(f"{{{NS_REL}}}id")
        target = rel_map.get(rel_id, "")
        if not target:
            continue
        target_path = target if target.startswith("xl/") else f"xl/{target}"
        sheets.append(
            {
                "name": sheet.attrib.get("name", "Worksheet"),
                "target": target_path,
            }
        )
    return sheets


def column_index(cell_ref):
    letters = re.match(r"([A-Z]+)", str(cell_ref or ""))
    if not letters:
        return 0
    index = 0
    for char in letters.group(1):
        index = (index * 26) + (ord(char) - 64)
    return index - 1


def read_cell_value(cell, shared_strings):
    cell_type = cell.attrib.get("t", "")

    if cell_type == "inlineStr":
        texts = [node.text or "" for node in cell.iterfind(f".//{q(NS_MAIN, 't')}")]
        return "".join(texts).strip()

    value_node = cell.find(q(NS_MAIN, "v"))
    if value_node is None:
        return ""

    raw_value = value_node.text or ""

    if cell_type == "s":
        try:
            return shared_strings[int(raw_value)].strip()
        except Exception:
            return raw_value.strip()

    if cell_type == "b":
        return "TRUE" if raw_value == "1" else "FALSE"

    return raw_value.strip()


def read_sheet_rows(archive, sheet_target, shared_strings):
    root = ET.fromstring(archive.read(sheet_target))
    sheet_data = root.find(f".//{q(NS_MAIN, 'sheetData')}")
    if sheet_data is None:
        return []

    rows = []
    for row in sheet_data.findall(q(NS_MAIN, "row")):
        values = {}
        highest_index = -1
        for cell in row.findall(q(NS_MAIN, "c")):
            idx = column_index(cell.attrib.get("r"))
            if idx < 0:
                continue
            values[idx] = read_cell_value(cell, shared_strings)
            highest_index = max(highest_index, idx)

        if highest_index < 0:
            rows.append([])
            continue

        ordered = ["" for _ in range(highest_index + 1)]
        for idx, value in values.items():
            ordered[idx] = value
        rows.append(ordered)

    return rows


def normalize_sheet(rows):
    header_index = None
    headers = []
    for index, row in enumerate(rows):
        if any(str(value or "").strip() for value in row):
            header_index = index
            headers = [str(value or "").strip() or f"Column {col + 1}" for col, value in enumerate(row)]
            break

    if header_index is None:
        return {"headers": [], "rows": []}

    items = []
    for row in rows[header_index + 1 :]:
        if not any(str(value or "").strip() for value in row):
            continue
        item = {}
        for col, header in enumerate(headers):
            item[header] = str(row[col] if col < len(row) else "").strip()
        items.append(item)

    return {
        "headers": headers,
        "rows": items,
    }


def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Excel file path is required"}))
        sys.exit(1)

    file_path = Path(sys.argv[1]).resolve()
    if not file_path.exists():
        print(json.dumps({"error": f"Excel file not found: {file_path}"}))
        sys.exit(1)

    with zipfile.ZipFile(file_path) as archive:
        shared_strings = read_shared_strings(archive)
        sheets = []
        for sheet in read_sheet_targets(archive):
            raw_rows = read_sheet_rows(archive, sheet["target"], shared_strings)
            normalized = normalize_sheet(raw_rows)
            sheets.append(
                {
                    "name": sheet["name"],
                    "headers": normalized["headers"],
                    "rows": normalized["rows"],
                }
            )

    print(
        json.dumps(
            {
                "filePath": str(file_path),
                "sheets": sheets,
            },
            ensure_ascii=False,
        )
    )


if __name__ == "__main__":
    main()
