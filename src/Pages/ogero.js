import React, { useState, useEffect } from 'react';
import "../Styles/ogero2.css";
import "../Styles/ogero.css";

const SortableTable = () => {
    const [results, setResults] = useState([]);
    const [sortConfig, setSortConfig] = useState({ column: 0, ascending: true });

    const CODES = {
        end: 'End',
        home: 'Home',
        left: 'ArrowLeft',
        right: 'ArrowRight',
        up: 'ArrowUp',
        down: 'ArrowDown',
        a: 'KeyA',
        s: 'KeyS',
        d: 'KeyD',
        w: 'KeyW',
        enter: 'Enter',
        space: 'Space'
    };

    const headerColumns = [
        'ID', 'FIRST', 'LAST', 'IMAGE', 'PHONE',
        'ADDRESS', 'CITY', 'STATE', 'ZIP', 'MEMBER SINCE'
    ];

    useEffect(() => {
        const fetchData = async () => {
            let storedData = sessionStorage.getItem('userdata');
            if (storedData) {
                setResults(JSON.parse(storedData));
            } else {
                try {
                    const response = await fetch('https://randomuser.me/api/?nat=us&results=10');
                    if (!response.ok) throw new Error(`Error: ${response.status}`);
                    const data = await response.json();
                    sessionStorage.setItem('userdata', JSON.stringify(data.results));
                    setResults(data.results);
                } catch (error) {
                    console.error(error);
                }
            }
        };
        fetchData();
    }, []);

    const focusOnColumn = (index) => {
        const buttons = document.querySelectorAll('.js-column-button');
        if (buttons[index]) {
            buttons[index].focus();
        }
    };

    const focusOnElement = (direction) => {
        const focusableElements = 'button:not([disabled]), [tabindex]:not([disabled]):not([tabindex="-1"])';
        const focusable = Array.from(document.querySelectorAll(focusableElements));
        const lastFocusableIndex = focusable.length - 1;
        const index = focusable.indexOf(document.activeElement);

        if (index === 0 && direction === 'previous') {
            return focusOnColumn(lastFocusableIndex);
        }
        if (index === lastFocusableIndex && direction === 'next') {
            return focusOnColumn(0);
        }
        if (index < 0 || index > lastFocusableIndex) {
            return focusOnColumn(direction === 'next' ? 0 : lastFocusableIndex);
        }
        focusOnColumn(direction === 'next' ? index + 1 : index - 1);
    };

    useEffect(() => {
        const handleKeydown = (event) => {
            const key = event.code;

            switch (key) {
                case CODES.end:
                    event.preventDefault();
                    focusOnColumn(9);
                    break;
                case CODES.home:
                    event.preventDefault();
                    focusOnColumn(0);
                    break;
                case CODES.right:
                case CODES.down:
                case CODES.d:
                case CODES.s:
                    event.preventDefault();
                    focusOnElement('next');
                    break;
                case CODES.left:
                case CODES.up:
                case CODES.a:
                case CODES.w:
                    event.preventDefault();
                    focusOnElement('previous');
                    break;
                case CODES.enter:
                case CODES.space:
                    event.preventDefault();
                    const activeElement = document.activeElement;
                    if (activeElement && activeElement.classList.contains('js-column-button')) {
                        const columnIndex = parseInt(activeElement.getAttribute('data-col'), 10);
                        handleHeaderClick(columnIndex);
                    }
                    break;
                default:
                    break;
            }
        };

        document.addEventListener('keydown', handleKeydown);
        return () => {
            document.removeEventListener('keydown', handleKeydown);
        };
    }, [CODES]);

    const sortTable = (columnIndex, ascending) => {
        const sortedResults = [...results].sort((a, b) => {
            let aValue, bValue;
            switch (columnIndex) {
                case 3:
                    aValue = a.picture.thumbnail;
                    bValue = b.picture.thumbnail;
                    break;
                case 5:
                    aValue = a.location.street.number;
                    bValue = b.location.street.number;
                    break;
                case 9:
                    aValue = new Date(a.registered.date);
                    bValue = new Date(b.registered.date);
                    break;
                default:
                    aValue = a[headerColumns[columnIndex].toLowerCase()] || '';
                    bValue = b[headerColumns[columnIndex].toLowerCase()] || '';
                    break;
            }
            if (aValue < bValue) return ascending ? -1 : 1;
            if (aValue > bValue) return ascending ? 1 : -1;
            return 0;
        });
        setResults(sortedResults);
        setSortConfig({ column: columnIndex, ascending });
    };

    const handleHeaderClick = (columnIndex) => {
        const isAscending = sortConfig.column === columnIndex && sortConfig.ascending;
        sortTable(columnIndex, !isAscending);
    };

    return (
        <div>
            <header className="c-header">
                <h2 className="c-header__title">Sortable Columns Table</h2>
                <h3 className="c-header__subtitle">
                    Directional Keys: <code>tab</code>, <code>shift+tab</code>, <code>↑</code>, <code>↓</code>, <code>←</code>, <code>→</code>, <code>w</code>, <code>s</code>, <code>a</code>, <code>d</code>, <code>home</code>, <code>end</code>
                </h3>
                <h2 className="c-header__subtitle">
                    Trigger Column Sort Keys (column focus required): <code>enter</code>, <code>space</code>
                </h2>
            </header>
            <main className="l-table-container">
                <table className="c-table" role="grid" aria-readonly="true">
                    <thead className="c-table__head">
                        <tr>
                            {headerColumns.map((col, index) => (
                                <th key={index} role="columnheader" scope="col" className="c-table__th">
                                    <button
                                        className="c-table__button js-column-button"
                                        data-col={index}
                                        onClick={() => handleHeaderClick(index)}
                                    >
                                        {col}
                                        <span
                                            className={`c-table__button--icon ${sortConfig.column === index
                                                ? sortConfig.ascending
                                                    ? 'c-table__button--asc'
                                                    : 'c-table__button--desc'
                                                : ''
                                                }`}
                                            aria-hidden="true"
                                        />
                                    </button>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="c-table__body">
                        {results.length ? (
                            results.map((user, index) => (
                                <tr key={index} className="c-table__tr" role="row">
                                    <th className="c-table__td c-table__td--font-300" data-label="ID" scope="row" role="rowheader">
                                        {index + 1}
                                    </th>
                                    <td className="c-table__td" data-label="FIRST" role="gridcell">
                                        {user?.name?.first}
                                    </td>
                                    <td className="c-table__td" data-label="LAST" role="gridcell">
                                        {user?.name?.last}
                                    </td>
                                    <td className="c-table__td c-table__td--image" data-label="IMAGE" role="gridcell">
                                        <img alt={`${user?.name?.first} ${user?.name?.last}`} className="c-table__image" loading="eager" src={user?.picture?.thumbnail} />
                                    </td>
                                    <td className="c-table__td" data-label="PHONE" role="gridcell">
                                        {user?.cell.replace('-', ' ')}
                                    </td>
                                    <td className="c-table__td" data-label="ADDRESS" role="gridcell">
                                        {user?.location?.street?.number} {user?.location?.street?.name}
                                    </td>
                                    <td className="c-table__td" data-label="CITY" role="gridcell">
                                        {user?.location?.city}
                                    </td>
                                    <td className="c-table__td" data-label="STATE" role="gridcell">
                                        {user?.location?.state}
                                    </td>
                                    <td className="c-table__td" data-label="ZIP" role="gridcell">
                                        {user?.location?.postcode}
                                    </td>
                                    <td className="c-table__td" data-label="MEMBER SINCE" role="gridcell">
                                        {new Date(user?.registered?.date).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr className="c-table__tr" role="row">
                                <td colSpan
="10" className="has-error c-table__td">No data available. Please try again later.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </main>
        </div>
    );
};

export default SortableTable;
