import * as ReactDOM from 'react-dom';
import { extend } from '@syncfusion/ej2-base';
import { KanbanComponent, ColumnsDirective, ColumnDirective } from "@syncfusion/ej2-react-kanban";
import { useState, useEffect, useRef, useContext } from 'react';
import { Ajax } from '@syncfusion/ej2-base';
import { DataManager, Query } from '@syncfusion/ej2-data';
import { DropDownListComponent } from '@syncfusion/ej2-react-dropdowns';
import { ButtonComponent } from '@syncfusion/ej2-react-buttons';
import { TextBoxComponent } from '@syncfusion/ej2-react-inputs';
import { UserContext } from "../../../../UserContext";
import './kanban.css'

function App() {
    const [kanbanData, setKanbanData] = useState([]);
    const ajaxUrl = 'https://app.herofashion.com/diwasg/';

    const { username } = useContext(UserContext);
    console.log(username)
    const data = new DataManager(kanbanData);
    const [query, setQuery] = useState(new Query());

    const filterMyData = () => {
        if (username) {
            setQuery(
                new Query().where('asgby_name', 'contains', username, true)
            );
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    interface KanbanDataModel {
        Id?: string;
        Title?: string;
        Status?: string;
        Summary?: string;
        Type?: string;
        Priority?: string;
        Tags?: string;
        Estimate?: number;
        Assignee?: string;
        RankId?: number;
        Color?: string;
    }
    function cardTemplate(props: any) {
        return (<div className="card-template">
            <div className='e-card-content'>
                <table className="card-template-wrap">
                    <tbody>
                        <tr>
                            <td className="e-label">EntryNo</td>
                            <td><b>{props.entryno}</b></td>
                        </tr>
                        <tr>
                            <td className="e-label">Assignor</td>
                            <td>{props.asgby_name}</td>
                        </tr>
                        <tr>
                            <td className="e-label">Assignee</td>
                            <td>{props.field_empname}</td>
                        </tr>
                        <tr>

                            <td><div className="e-card-tags"><div className="e-card-tag e-card-label">{props.wrkcat}</div></div></td>
                            <td><div className="e-card-tags"><div className="e-card-tag e-card-label">{props.asgby_code}</div></div></td>
                            <td><img src={props.photo_url} alt={props.ImageURL} height={50} width={50} style={{ borderRadius: '30px' }} /></td>
                        </tr>

                    </tbody>
                </table>
            </div>
        </div>);
    }
    const loadData = () => {
        const ajax = new Ajax({
            url: "https://app.herofashion.com/diwasg/",
            type: 'GET',
            mode: true, // cross-domain
            onSuccess: (result: any) => {
                const data = JSON.parse(result);
                setKanbanData(data);
            },
            onFailure: (error: any) => {
                console.error('Load failed:', error);
            }
        });
        ajax.send();
    };

    const handleActionComplete = (args: any) => {
        if (args.requestType === 'cardCreated' && args.addedRecords) {
            // Handle Insert
            args.addedRecords.forEach((card: any) => {
                const ajax = new Ajax({
                    url: ajaxUrl,
                    type: 'POST',
                    mode: true,
                    contentType: 'application/json',
                    data: JSON.stringify({ action: 'insert', data: card }),
                    onSuccess: (result: any) => {
                        console.log('Card inserted successfully');
                    },
                    onFailure: (error: any) => {
                        console.error('Insert failed:', error);
                    }
                });
                ajax.send();
            });
        }
        else if (args.requestType === 'cardChanged' && args.changedRecords) {
            // Handle Update
            let updateUrl = ajaxUrl + args.changedRecords[0]['asgby_code'] + "/";
            args.changedRecords.forEach((card: any) => {
                const ajax = new Ajax({
                    url: updateUrl,
                    type: 'PUT',
                    mode: true,
                    contentType: 'application/json',
                    data: JSON.stringify(args.changedRecords[0]),
                    onSuccess: (result: any) => {
                        console.log('Card updated successfully');
                    },
                    onFailure: (error: any) => {
                        console.error('Update failed:', error);
                    }
                });
                ajax.send();
            });
        }

        else if (args.requestType === 'cardRemoved' && args.deletedRecords) {
            // Handle Delete
            args.deletedRecords.forEach((card: any) => {
                const ajax = new Ajax({
                    url: ajaxUrl,
                    type: 'POST',
                    mode: true,
                    contentType: 'application/json',
                    data: JSON.stringify({ action: 'delete', data: card }),
                    onSuccess: () => {
                        console.log('Card removed successfully');
                    },
                    onFailure: (error: any) => {
                        console.error('Remove failed:', error);
                    }
                });
                ajax.send();
            });
        }
    };
    const KanbanDialogFormTemplate = (props: any) => {
        const [assigneeData, setAssigneeData] = useState([]);
        const [assignorData, setAssignorData] = useState([]);
        useEffect(() => {
            const fetchData = async () => {
                const response = await fetch('https://app.herofashion.com/diwasg/');
                if (!response.ok) {
                    throw new Error('Failed to fetch data');
                }
                const data = await response.json();

                // Extract field_empname from all items and filter out null/empty values
                const assigneeNames = data
                    .map((item: any) => item.field_empname)
                    .filter((name: any) => name != null && name !== '');

                setAssigneeData(assigneeNames);
                const assignorNames = data
                    .map((item: any) => item.asgby_name)
                    .filter((name: any) => name != null && name !== '');
                setAssignorData(assignorNames);

            };

            fetchData();
        }, []);
        let statusData: string[] = ["Open", "InProgress", "Testing", "Close"];
        const [state, setState] = useState(extend({}, {}, props, true));
        const onChange = (args: any): void => {

            let key: string = args.target.name;
            let value: string = args.target.value;
            setState({ [key]: value });
        };
        let data: any = state;
        return (
            <div>
                <table>
                    <tbody>
                        <tr>
                            <td className="e-label">ID</td>
                            <td>
                                <div className="e-float-input e-control-wrapper">
                                    <input
                                        id="Id"
                                        name="Id"
                                        type="text"
                                        className="e-field"
                                        value={data.entryno}
                                        disabled
                                    />
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td className="e-label">Work Type</td>
                            <td>
                                <DropDownListComponent
                                    id="Status"
                                    name="Status"
                                    dataSource={statusData}
                                    className="e-field"
                                    placeholder="Status"
                                    value={data.worktype1}
                                ></DropDownListComponent>
                            </td>
                        </tr>
                        <tr>
                            <td className="e-label">Assignor</td>
                            <td>
                                <DropDownListComponent
                                    id="Assignee"
                                    name="Assignee"
                                    className="e-field"
                                    dataSource={assignorData}
                                    placeholder="Assignee"
                                    value={data.asgby_name}
                                ></DropDownListComponent>
                            </td>
                        </tr>
                        <tr>
                            <td className="e-label">Assignee</td>
                            <td>
                                <DropDownListComponent
                                    type="text"
                                    name="Priority"
                                    id="Priority"
                                    popupHeight="300px"
                                    className="e-field"
                                    value={data.field_empname}
                                    dataSource={assigneeData}
                                    placeholder="Priority"
                                ></DropDownListComponent>
                            </td>
                        </tr>
                        <tr>
                            <td className="e-label">Time</td>
                            <td>
                                <div className="e-float-input e-control-wrapper">
                                    <textarea
                                        name="Summary"
                                        className="e-field"
                                        value={data.asgdt}
                                        onChange={onChange}
                                    ></textarea>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    };
    const dialogTemplate = (props: any) => {
        return <KanbanDialogFormTemplate {...props} />;
    };

    const imageContainer: HTMLElement | null = document.getElementById('image-container') as HTMLElement;
    if (imageContainer) {
        const circularImages: NodeListOf<HTMLElement> = imageContainer.querySelectorAll('.circular-image');
        circularImages.forEach((image: HTMLElement) => {
            image.addEventListener('click', (event: Event) => {
                const target = event.target as HTMLImageElement;
                if (target.tagName === 'IMG') {
                    let altText: any = target.alt;
                    if (altText) {
                        const newQuery = new Query().where('asgby_name', 'equal', altText);
                        setQuery(newQuery);
                    }
                }
            });
        });
    }

    let priorityObj = useRef(null);
    let kanbanObj = useRef(null);
    let textBoxObj = useRef(null);
    let statusObj = useRef(null);
    let priorityData = ["None", "High", "Normal", "Low"];
    let statusData = [
        { id: "To Do", value: "Open" },
        { id: "In Progress", value: "InProgress" },
        { id: "Testing", value: "Testing" },
        { id: "Done", value: "Close" },
    ];
    let value = "None";
    let fields = { text: "id", value: "value" };
    const prioritySelect = (args: any) => {
        let filterQuery = new Query();
        if (args.itemData.value !== "None") {
            filterQuery = new Query().where("Priority", "equal", args.itemData.value);
        }
        (statusObj.current as any).value = "None";
        (kanbanObj.current as any).query = filterQuery;
    };
    const statusSelect = (args: any) => {
        let filterQuery = new Query();
        if (args.itemData.value !== "None") {
            filterQuery = new Query().where("worktype1", "equal", args.itemData.value);
        }
        (priorityObj.current as any).value = "None";
        (kanbanObj.current as any).query = filterQuery;
    };
    const searchClick = (e: any) => {
        let searchValue = e.value;
        let searchQuery = new Query();
        if (searchValue !== "") {
            searchQuery = new Query().search(searchValue, ["asgby_name", "wrkcat"], "contains", true);
        }
        (kanbanObj.current as any).query = searchQuery;
    };
    const resetClick = () => {
        (textBoxObj.current as any).value = "";
        reset();
    };
    const onFocus = (e: any) => {
        if (e.target.value === "") {
            reset();
        }
    };
    const reset = () => {
        (priorityObj.current as any).value = "None";
        (statusObj.current as any).value = "None";
        setQuery(new Query());
    };

    return (
        <div style={{ marginTop: '100px' }}>
            <div className="col-lg-3 property-section" id="searchFilterProperty">
                <div title="Filtering">Filtering
                    <table className="e-filter-table">
                        <tbody>
                            <tr>
                                <td className="e-filter-label">
                                    <div>Priority</div>
                                </td>
                                <td>
                                    <div>
                                        <DropDownListComponent
                                            id="priority_filter"
                                            ref={priorityObj}
                                            dataSource={priorityData}
                                            select={prioritySelect}
                                            value={value}
                                            placeholder="Select a priority"
                                        ></DropDownListComponent>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td className="e-filter-label">
                                    <div>Status</div>
                                </td>
                                <td>
                                    <DropDownListComponent
                                        id="status_filter"
                                        ref={statusObj}
                                        dataSource={statusData}
                                        select={statusSelect}
                                        value={value}
                                        fields={fields}
                                        placeholder="Select a status"
                                    ></DropDownListComponent>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <p className="property-panel-header" style={{ width: '100%', padding: '22px 0 0 0' }}>Searching</p>
                    <div className="filtering property-panel-content">
                        <table className="e-filter-table">
                            <tbody>
                                <tr>
                                    <td>
                                        <div>
                                            <TextBoxComponent
                                                id="search_text"
                                                ref={textBoxObj}
                                                showClearButton={true}
                                                placeholder="Enter search text"
                                                onFocus={onFocus}
                                                input={searchClick}
                                            />
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                        <div className="e-reset-button">
                            <ButtonComponent
                                id="reset_filter"
                                className="e-btn"
                                onClick={resetClick}
                            >
                                Reset
                            </ButtonComponent>
                            <ButtonComponent onClick={filterMyData}>
                                My Task
                            </ButtonComponent>
                        </div>
                    </div>
                </div>
            </div>
            <div className="datasource-filter-container">

                <div id="image-container" className="custom-dropdown">
                    <img src="https://app.herofashion.com/staff_images/10006.jpg" alt="PREMAVATHI.N" className="circular-image" title="Martin Tamer" style={{ width: '35px', height: '35px' }} />
                    <img src="https://app.herofashion.com/staff_images/10014.jpg" alt="SARANYA.S" className="circular-image" title="Rose Fuller" style={{ width: '35px', height: '35px' }} />
                    <img src="https://app.herofashion.com/staff_images/10021.jpg" alt="KANDASAMY.M" className="circular-image" title="Margaret Buchanan" style={{ width: '35px', height: '35px' }} />
                    <img src="https://app.herofashion.com/staff_images/10022.jpg" alt="VIJAYAKUMAR.K" className="circular-image" title="Fuller King" style={{ width: '35px', height: '35px' }} />
                    <img src="https://app.herofashion.com/staff_images/10028.jpg" alt="THANGADURAI.P" className="circular-image" title="Davolio Fuller" style={{ width: '35px', height: '35px' }} />
                </div>
            </div>
            <KanbanComponent
                id="kanban"
                keyField="worktype1"
                // dataSource={kanbanData}
                dataSource={data}
                ref={kanbanObj}
                query={query}
                actionComplete={handleActionComplete}
                swimlaneSettings={{ keyField: "asgby_code" }}
                cardSettings={{
                    headerField: "entryno",
                    template: cardTemplate,
                    grabberField: 'color',
                }}
                dialogSettings={{ template: dialogTemplate }}
            >
                <ColumnsDirective>
                    <ColumnDirective headerText="To Do" keyField="Ordinary" showAddButton={true} />
                    <ColumnDirective headerText="In Progress" keyField="InProgress" />
                    <ColumnDirective headerText="Review" keyField="Testing" />
                    <ColumnDirective headerText="Done" keyField="Close" />
                </ColumnsDirective>
            </KanbanComponent>
        </div>
    );
}

export default App;