import { SimplifiedEvent } from "./eventConverters";
import { IDataExport } from "./IDataExport";

export function exportData(dataExport: IDataExport) {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dataExport));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "fast-calender_data_export.json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

export async function importData(dataExportFile: File, templates: SimplifiedEvent[]): Promise<IDataExport> {
    const data: IDataExport = JSON.parse(await dataExportFile.text());

    const filteredTemplates = data.templates.filter((template) => {
        const duplicates = templates.filter((t) => t.title === template.title && t.start === template.start && t.end === template.end && t.allDay === template.allDay);

        return duplicates.length === 0;
    });

    data.templates = filteredTemplates;

    return data;
}