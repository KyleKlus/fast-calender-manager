import { computePosition, offset, flip, shift, arrow, autoUpdate } from "@floating-ui/dom/dist/floating-ui.dom";

export function setupTooltip(eventEl: HTMLElement, title: string, description?: string) {
    const hash: any = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const id = `event-${hash}`
    eventEl.id = id;
    const tooltip = document.createElement("div");
    tooltip.classList.add("custom-tooltip");
    tooltip.id = 'tooltip-' + id;
    tooltip.role = "tooltip";

    const tooltipTitle = document.createElement("div");
    tooltipTitle.classList.add('tooltip-title');
    tooltipTitle.innerText = title;
    tooltip.appendChild(tooltipTitle);

    if (description !== undefined && description !== '') {
        const tooltipHr = document.createElement("hr");
        tooltip.appendChild(tooltipHr);

        const tooltipDescription = document.createElement("div");
        tooltipDescription.classList.add('tooltip-description');
        tooltipDescription.innerHTML = description;
        tooltip.appendChild(tooltipDescription);
    }

    const arrowEl = document.createElement("div");
    arrowEl.id = 'arrow-' + id;
    arrowEl.classList.add("tooltip-arrow");
    tooltip.appendChild(arrowEl);
    document.body.appendChild(tooltip);

    function update() {
        computePosition(eventEl, tooltip, {
            placement: 'top',
            middleware: [offset(6), flip(), shift({ padding: 5 }), arrow({ element: arrowEl }),],
        }).then(({ x, y, placement, middlewareData }) => {
            Object.assign(tooltip.style, {
                left: `${x}px`,
                top: `${y}px`,
            });

            // Accessing the data
            const arrowX = middlewareData.arrow?.x;
            const arrowY = middlewareData.arrow?.y;

            const staticSide = {
                top: 'bottom',
                right: 'left',
                bottom: 'top',
                left: 'right',
            }[placement.split('-')[0]];

            if (staticSide === undefined) return;

            Object.assign(arrowEl.style, {
                left: arrowX != null ? `${arrowX}px` : '',
                top: arrowY != null ? `${arrowY}px` : '',
                right: '',
                bottom: '',
                [staticSide]: '-4px',
            });
        });
    }

    function showTooltip() {
        eventEl.setAttribute('data-show', 'true');

        setTimeout(() => {
            if (!eventEl.hasAttribute('data-show')) return;
            tooltip.style.display = 'block';
            update();
        }, 500);
    }

    function hideTooltip() {
        tooltip.style.display = '';
        eventEl.removeAttribute('data-show');
    }

    [
        { event: 'mouseenter', listener: showTooltip },
        { event: 'mouseleave', listener: hideTooltip },
        { event: 'focus', listener: showTooltip },
        { event: 'blur', listener: hideTooltip },
    ].forEach((e: { event: string, listener: () => void }) => {
        eventEl.addEventListener(e.event, e.listener);
    });

    const cleanup = autoUpdate(
        eventEl,
        tooltip,
        update,
    );

}