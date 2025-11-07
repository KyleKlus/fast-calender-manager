import { createContext, useState } from 'react';
import React from 'react';
import { DateTime } from 'luxon';

interface IDateInViewContext {
    dateInView: DateTime;
    setDateInView: (date: DateTime) => void;
}

const DateInViewContext = createContext<IDateInViewContext>({
    dateInView: DateTime.now(),
    setDateInView: (date: DateTime) => { },
});

function DateInViewProvider(props: React.PropsWithChildren<{}>) {
    const [dateInView, setDateInView] = useState(DateTime.now());

    return (
        <DateInViewContext.Provider value={{ dateInView, setDateInView }}>
            {props.children}
        </DateInViewContext.Provider>
    );
};

export { DateInViewContext, DateInViewProvider };