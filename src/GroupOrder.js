import React from 'react';
import Select from "react-dropdown-select";

const styles = {
    selectButton: {
        backgroundColor: '#364050',
        color: '#ffff',
        marginRight: '50px',
        marginTop: '20px',
        border: 'none',
        borderRadius: '4px',
    }
}

const GroupOrder = (props) => {
    const handleChange = (value) => {
        props.onChangeGroup(value);
    }
   
    return(
        <div>
            <Select 
                options={props.options}
                color="#364050"
                style={styles.selectButton} 
                values={props.value}
                onChange={handleChange}
            />
        </div>
    )
}

export default GroupOrder;