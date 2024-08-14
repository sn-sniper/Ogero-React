import React from "react";
import SortableTable from "./ogero";
import "../Styles/ogero2.css";
import "../Styles/ogero.css";

const Origin = () => {
    return (
        <div>
            <div className="shape2"></div>
            <div className="shape1"></div>
            <pre class="shape">Sortable Columns Table:</pre>
            <SortableTable />   
        </div>
    );
};

export default Origin;
