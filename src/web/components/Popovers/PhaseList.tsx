import { Button, FormControl } from 'react-bootstrap/esm';
import './PhaseList.css';

import { useState } from 'react';

export interface IPhaseListProps {
    phases: string[];
    addPhase: (phase: string) => void;
    removePhase: (phase: string) => void;
}

export default function PhaseList(props: IPhaseListProps) {
    const [newPhase, setNewPhase] = useState('');
    return (
        <div className='phase-list'>
            <h4>Phases</h4>
            <div className='phase-list-item'>
                <FormControl id='phase-input' type='text' placeholder='Add Phase' value={newPhase} onChange={(e) => {
                    setNewPhase(e.target.value);
                }} />
                <Button variant='primary' className='add-phase-button' onClick={() => {
                    props.addPhase(newPhase);
                    setNewPhase('');
                }}><i className='bi-plus-circle'></i></Button>
            </div>
            <hr />
            {props.phases.map((phase) => {
                return (
                    <div className='phase-list-item' key={phase}>
                        <span>{phase}</span>
                        <Button variant='danger' className='remove-phase-button' onClick={() => {
                            props.removePhase(phase);
                        }}><i className='bi-trash'></i></Button>
                    </div>
                );
            })}

        </div>
    );
}
