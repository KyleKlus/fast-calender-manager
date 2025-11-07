import { createContext, useEffect, useState } from 'react';
import React from 'react';
import { DateTime } from 'luxon';
import { SimplifiedEvent } from '../handlers/eventConverters';

interface ITemplateContext {
    templates: SimplifiedEvent[];
    areTemplatesLoaded: boolean;
    selectedTemplate: { template: SimplifiedEvent | null, index: number };
    setTemplates: (templates: SimplifiedEvent[]) => void;
    setAreTemplatesLoaded: (areTemplatesLoaded: boolean) => void;
    setSelectedTemplate: (selectedTemplate: { template: SimplifiedEvent | null, index: number }) => void;
    resetSelectedTemplate: () => void;
    swapTemplates: (firstIndex: number, secondIndex: number) => void;
    switchSelectedTemplate: (switchDirection: 'prev' | 'next') => void;
    addTemplate: (template: SimplifiedEvent) => void;
    editTemplate: (template: SimplifiedEvent, index: number) => void;
    deleteTemplate: (index: number) => void;
    getTemplateDuration: (template: SimplifiedEvent) => number;
}


const TemplateContext = createContext<ITemplateContext>({
    templates: [],
    areTemplatesLoaded: false,
    selectedTemplate: { template: null, index: -1 },
    setTemplates: (templates: SimplifiedEvent[]) => { },
    setAreTemplatesLoaded: (areTemplatesLoaded: boolean) => { },
    setSelectedTemplate: (selectedTemplate: { template: SimplifiedEvent | null, index: number }) => { },
    resetSelectedTemplate: () => { },
    swapTemplates: (firstIndex: number, secondIndex: number) => { },
    switchSelectedTemplate: (switchDirection: 'prev' | 'next') => { },
    addTemplate: (template: SimplifiedEvent) => { },
    editTemplate: (template: SimplifiedEvent, index: number) => { },
    deleteTemplate: (index: number) => { },
    getTemplateDuration: (template: SimplifiedEvent) => { return -1 },
});

function TemplateProvider(props: React.PropsWithChildren<{}>) {
    const [templates, setTemplates] = useState<SimplifiedEvent[]>([]);
    const [areTemplatesLoaded, setAreTemplatesLoaded] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<{ template: SimplifiedEvent | null, index: number }>({ template: null, index: -1 });

    useEffect(() => {
        if (areTemplatesLoaded) { return }
        loadTemplates();
        setAreTemplatesLoaded(true);
    }, [areTemplatesLoaded]);

    function loadTemplates() {
        const loadedTemplates = localStorage.getItem('eventTemplates');
        if (loadedTemplates) {
            setTemplates(JSON.parse(loadedTemplates));
        }
    }

    function swapTemplates(firstIndex: number, secondIndex: number) {
        let newTemplates: SimplifiedEvent[] = templates.splice(0, templates.length);

        const firstTemplate = newTemplates[firstIndex];
        newTemplates[firstIndex] = newTemplates[secondIndex];
        newTemplates[secondIndex] = firstTemplate;

        localStorage.setItem('eventTemplates', JSON.stringify(newTemplates));
        setTemplates(newTemplates);
    }

    function switchSelectedTemplate(switchDirection: 'prev' | 'next') {
        if (selectedTemplate.index === -1 ||
            (switchDirection === 'prev' && selectedTemplate.index === 0) ||
            (switchDirection === 'next' && selectedTemplate.index === templates.length - 1)) {
            return;
        }

        const newSelectedTemplateIndex = switchDirection === 'prev'
            ? selectedTemplate.index - 1
            : selectedTemplate.index + 1

        swapTemplates(selectedTemplate.index, newSelectedTemplateIndex);

        setSelectedTemplate({ template: templates[newSelectedTemplateIndex], index: newSelectedTemplateIndex });
    }

    function addTemplate(template: SimplifiedEvent) {
        localStorage.setItem('eventTemplates', JSON.stringify([...templates, template]));
        setTemplates([...templates, template]);
    }

    function editTemplate(template: SimplifiedEvent, index: number) {
        localStorage.setItem('eventTemplates', JSON.stringify([...templates.map((e: any, i: number) => {
            if (i === index) {
                return template;
            }
            return e;
        })]));
        setTemplates([...templates.map((e: any, i: number) => {
            if (i === index) {
                return template;
            }
            return e;
        })]);
    }

    function deleteTemplate(index: number) {
        localStorage.setItem('eventTemplates', JSON.stringify([...templates.filter((e: any, i: number) => i !== index)]));
        setTemplates([...templates.filter((e: any, i: number) => i !== index)]);
    }

    function resetSelectedTemplate() {
        setSelectedTemplate({ template: null, index: -1 });
    }

    function getTemplateDuration(template: SimplifiedEvent): number {
        const start = DateTime.fromISO(template.start);
        const end = DateTime.fromISO(template.end);
        return end.diff(start).as('minutes');
    }

    return (
        <TemplateContext.Provider value={{ templates, areTemplatesLoaded, selectedTemplate, setTemplates, setAreTemplatesLoaded, setSelectedTemplate, resetSelectedTemplate, swapTemplates, switchSelectedTemplate, addTemplate, editTemplate, deleteTemplate, getTemplateDuration }}>
            {props.children}
        </TemplateContext.Provider>
    );
};

export { TemplateContext, TemplateProvider };