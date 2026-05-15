import * as ReactDOM from 'react-dom';
import { extend } from '@syncfusion/ej2-base';
import { KanbanComponent, ColumnsDirective, ColumnDirective } from "@syncfusion/ej2-react-kanban";
import { useState, useEffect, useRef, useContext } from 'react';
import { Ajax } from '@syncfusion/ej2-base';
import { DataManager, Query } from '@syncfusion/ej2-data';
import { DropDownListComponent } from '@syncfusion/ej2-react-dropdowns';
import { ButtonComponent } from '@syncfusion/ej2-react-buttons';
import { TextBoxComponent } from '@syncfusion/ej2-react-inputs';
import { RichTextEditorComponent, Inject, HtmlEditor, Toolbar, Image, Link, QuickToolbar } from '@syncfusion/ej2-react-richtexteditor';
import { DatePickerComponent } from '@syncfusion/ej2-react-calendars';
import { UserContext } from "../../../../UserContext";
import './kanban.css'

function App() {
    const [kanbanData, setKanbanData] = useState([]);
    const ajaxUrl = 'https://app.herofashion.com/diwasg/';

    const { username } = useContext(UserContext);
    console.log(username)
    const data = new DataManager(kanbanData);
    const [query, setQuery] = useState(new Query());
    const myTaskClick = () => {
        if (username) {      
         setQuery(
                new Query().where('field_empname', 'contains', username, true)
            );
        }
    }
    const myTeamTaskClick = () => {
        if (username) {
          setQuery(new Query().where('asgby_name', 'contains', username, true)
            );
        }
    }

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
                <div className="card-template-wrap">
                    <div className="card-row">
                        <span className="e-label">EntryNo</span>
                        <span className="card-value"><b>{props.entryno}</b></span>
                    </div>
                    <div className="card-row">
                        <span className="e-label">Assignor</span>
                        <span className="card-value">{props.asgby_name}</span>
                    </div>
                    <div className="card-row">
                        <span className="e-label">Assignee</span>
                        <span className="card-value">{props.field_empname}</span>
                    </div>
                    <div className="card-row card-row-footer">
                        <div className="card-tags-container">
                            <div className="e-card-tags"><div className="e-card-tag e-card-label">{props.wrkcat}</div></div>
                            <div className="e-card-tags"><div className="e-card-tag e-card-label">{props.asgby_code}</div></div>
                        </div>
                        <img src={props.photo_url} alt={props.ImageURL} className="card-image" />
                    </div>
                </div>
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

    const updateCardValue = (passedData?: any) => {    
    const currentData = kanbanData;
    // Define type for counts
    type Counts = { InProgress: number; Testing: number; Ordinary: number; Close: number };
    const counts: Counts = {
      InProgress: 0,
      Testing: 0,
      Ordinary: 0,
      Close: 0,
    };
    currentData.forEach((item: { worktype1: keyof Counts }) => {
      counts[item.worktype1]++;
    });
    updateCardElement('.detailcontainertodo', counts.Ordinary, 0);
    updateCardElement('.detailcontainertodo', counts.InProgress, 1);
    updateCardElement('.detailcontainertodo', counts.Testing, 2);
    updateCardElement('.detailcontainertodo', counts.Close, 3);
  }
  function updateCardElement(selector: string, count: number, indexNumber: number): void {
    const cardElement = document.querySelectorAll(selector)[indexNumber];
    const countTodoElement = cardElement?.querySelector('.counttodo');
    if (countTodoElement) {
      countTodoElement.innerHTML = count.toString();
    }
  }
  const kanbanDataBound = () => {
    updateCardValue();
  }
    const rteRef = useRef<RichTextEditorComponent | null>(null);
    const datePickerRef = useRef<DatePickerComponent | null>(null);

    const KanbanDialogFormTemplate = (props: any) => {
        const [rteInstance, setRteInstance] = useState<RichTextEditorComponent | null>(null);
        const [assigneeData, setAssigneeData] = useState([]);
        const [assignorData, setAssignorData] = useState([]);
        const [state, setState] = useState(extend({}, {}, props, true));
        const [datePickerInstance, setDatePickerInstance] = useState<DatePickerComponent | null>(null);
        

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

        // Cleanup function to destroy subcomponents
        useEffect(() => {
            return () => {
                // Cleanup RTE instance
                if (rteRef.current) {
                    (rteRef.current as any)?.destroy?.();
                }
                // Cleanup DatePicker instance
                if (datePickerRef.current) {
                    (datePickerRef.current as any)?.destroy?.();
                }
            };
        }, []);

        let statusData: string[] = ["Open", "InProgress", "Testing", "Close"];
        
        const onChange = (args: any): void => {
            if (args.target && args.target.name) {
                let key: string = args.target.name;
                let value: string = args.target.value;
                setState({ ...state, [key]: value });
            }
        };

        const onStatusChange = (args: any): void => {
            setState({ ...state, worktype1: args.value });
        };

        const onAssignorChange = (args: any): void => {
            setState({ ...state, asgby_name: args.value });
        };

        const onAssigneeChange = (args: any): void => {
            setState({ ...state, field_empname: args.value });
        };

        const onRteChange = (args: any): void => {
            setState({ ...state, Summary: args.value });
        };

        const onDateChange = (args: any): void => {
            setState({ ...state, asgdt: args.value });
        };

        const onRteCreated = (): void => {
            if (rteRef.current) {
                setRteInstance(rteRef.current);
            }
        };

        const onDatePickerCreated = (): void => {
            if (datePickerRef.current) {
                setDatePickerInstance(datePickerRef.current);
            }
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
                                        value={data.entryno || ''}
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
                                    change={onStatusChange}
                                ></DropDownListComponent>
                            </td>
                        </tr>
                        <tr>
                            <td className="e-label">Assignor</td>
                            <td>
                                <DropDownListComponent
                                    id="Assignor"
                                    name="Assignor"
                                    className="e-field"
                                    dataSource={assignorData}
                                    placeholder="Select Assignor"
                                    value={data.asgby_name}
                                    change={onAssignorChange}
                                ></DropDownListComponent>
                            </td>
                        </tr>
                        <tr>
                            <td className="e-label">Assignee</td>
                            <td>
                                <DropDownListComponent
                                    type="text"
                                    name="Assignee"
                                    id="Assignee"
                                    popupHeight="300px"
                                    className="e-field"
                                    value={data.field_empname}
                                    dataSource={assigneeData}
                                    placeholder="Select Assignee"
                                    change={onAssigneeChange}
                                ></DropDownListComponent>
                            </td>
                        </tr>
                        <tr>
                            <td className="e-label">Description</td>
                            <td>
                                <div>
                                    <RichTextEditorComponent
                                        id="rte-dialog"
                                        ref={rteRef}
                                        value={data.Summary || ''}
                                        change={onRteChange}
                                        created={onRteCreated}
                                        height="200px"
                                        toolbarSettings={{
                                            items: [  'Bold', 'Italic', 'Underline', 'StrikeThrough', 'InlineCode', '|', 'CreateLink', 'Image', 'CreateTable', 'CodeBlock',
                'HorizontalLine', 'Blockquote','|', 'LineHeight', 'Formats', 'Alignments', '|', 'BulletFormatList', 'NumberFormatList', 'Checklist' , '|', 'Outdent', 'Indent', '|',
                'FontColor', 'BackgroundColor', 'FontName', 'FontSize', '|', 'LowerCase', 'UpperCase', '|',  'Undo', 'Redo']
                                        }}
                                    >
                                        <Inject services={[HtmlEditor, Toolbar, Image, Link, QuickToolbar]} />
                                    </RichTextEditorComponent>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td className="e-label">Assignment Date</td>
                            <td>
                                <div className="e-float-input e-control-wrapper">
                                    <DatePickerComponent
                                        id="datepicker-dialog"
                                        ref={datePickerRef}
                                        value={data.asgdt ? new Date(data.asgdt) : new Date()}
                                        change={onDateChange}
                                        created={onDatePickerCreated}
                                        format="yyyy-MM-dd"
                                        placeholder="Select date"
                                    ></DatePickerComponent>
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

    const onDialogOpen = (args: any): void => {
        if (args.element) {
            // Initialize dialog form when opened
            const rteElement = args.element.querySelector('#rte-dialog');
            const datePickerElement = args.element.querySelector('#datepicker-dialog');
            
            if (rteElement) {
                console.log('Rich Text Editor initialized in dialog');
            }
            if (datePickerElement) {
                console.log('DatePicker initialized in dialog');
            }
            rteRef.current?.refreshUI();
        }
    };

    const onDialogClose = (args: any): void => {
        // Cleanup and destroy subcomponents when dialog closes
        if (args.element) {
            const rteElement = args.element.querySelector('#rte-dialog');
            const datePickerElement = args.element.querySelector('#datepicker-dialog');
            
            // Destroy RTE instance
            if (rteElement && (rteElement as any).ej2_instances) {
                (rteElement as any).ej2_instances[0]?.destroy?.();
            }
            
            // Destroy DatePicker instance
            if (datePickerElement && (datePickerElement as any).ej2_instances) {
                (datePickerElement as any).ej2_instances[0]?.destroy?.();
            }
            
            console.log('Dialog subcomponents destroyed');
        }
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
        <div className='m-4'>
          <div className="datasource-filter-container">
            <div className="card-container">
              <div className="inner-cadr">
                <div className="mainimagetodo"></div>
                <div className="detailcontainertodo">
                  <div className="texttodo">TO DO</div>
                  <div className="counttodo">0</div>
                </div>
              </div>
              <div className="inner-cadr">
                <div className="mainimageprogress"></div>
                <div className="detailcontainertodo">
                  <div className="texttodo change-font">In Progress</div>
                  <div className="counttodo">0</div>
                </div>
              </div>
              <div className="inner-cadr">
                <div className="mainimagetest"></div>
                <div className="detailcontainertodo">
                  <div className="texttodo">Testing</div>
                  <div className="counttodo">0</div>
                </div>
              </div>
              <div className="inner-cadr">
                <div className="mainimagedone"></div>
                <div className="detailcontainertodo">
                  <div className="texttodo">Done</div>
                  <div className="counttodo">0</div>
                </div>
              </div>
             </div>

            </div>
            <div className="property-section" id="searchFilterProperty">
                <div className="filter-wrapper">
                    <div className="button-section">
                        <div className="filter-header-left">Actions</div>
                        <div className="button-group">
                            <ButtonComponent
                                id="reset_filter"
                                className="e-primary e-btn btn-reset"
                                onClick={resetClick}
                            >
                                Reset
                            </ButtonComponent>
                            <ButtonComponent
                                id="my_task"
                                className="e-secondary e-btn btn-secondary"
                                onClick={myTaskClick}
                            >
                                My Task
                            </ButtonComponent>
                            <ButtonComponent
                                id="my_team_task"
                                className="e-secondary e-btn btn-secondary"
                                onClick={myTeamTaskClick}
                            >
                                My Team Task
                            </ButtonComponent>
                        </div>
                    </div>

                    <div className="filter-section">
                        <div className="filter-header">
                            <svg className="filter-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                            </svg>
                            Filtering
                        </div>
                        <div className="filter-container">
                            <div className="filter-group">
                                <label className="filter-label">Priority</label>
                                <DropDownListComponent
                                    id="priority_filter"
                                    ref={priorityObj}
                                    dataSource={priorityData}
                                    select={prioritySelect}
                                    value={value}
                                    placeholder="Select priority"
                                    className="filter-dropdown"
                                ></DropDownListComponent>
                            </div>
                            <div className="filter-group">
                                <label className="filter-label">Status</label>
                                <DropDownListComponent
                                    id="status_filter"
                                    ref={statusObj}
                                    dataSource={statusData}
                                    select={statusSelect}
                                    value={value}
                                    fields={fields}
                                    placeholder="Select status"
                                    className="filter-dropdown"
                                ></DropDownListComponent>
                            </div>
                            <div className="filter-group">
                                <label className="filter-label">Search</label>
                                <TextBoxComponent
                                    id="search_text"
                                    ref={textBoxObj}
                                    showClearButton={true}
                                    placeholder="Enter search text"
                                    onFocus={onFocus}
                                    input={searchClick}
                                    className="filter-search"
                                />
                            </div>
                            <div className="filter-group">
                                <label className="filter-label">Assignee</label>
                                <div id="kanban-image-container" className="custom-dropdown">
                                    <img src="https://app.herofashion.com/staff_images/10006.jpg" alt="PREMAVATHI.N" className="circular-image" title="Martin Tamer" style={{ width: '35px', height: '35px' }} />
                                    <img src="https://app.herofashion.com/staff_images/10014.jpg" alt="SARANYA.S" className="circular-image" title="Rose Fuller" style={{ width: '35px', height: '35px' }} />
                                    <img src="https://app.herofashion.com/staff_images/10021.jpg" alt="KANDASAMY.M" className="circular-image" title="Margaret Buchanan" style={{ width: '35px', height: '35px' }} />
                                    <img src="https://app.herofashion.com/staff_images/10022.jpg" alt="VIJAYAKUMAR.K" className="circular-image" title="Fuller King" style={{ width: '35px', height: '35px' }} />
                                    <img src="https://app.herofashion.com/staff_images/10028.jpg" alt="THANGADURAI.P" className="circular-image" title="Davolio Fuller" style={{ width: '35px', height: '35px' }} />
                                </div>
                            </div>
                        </div>
                    </div>
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
                swimlaneSettings={{ keyField: "field_empname" }}
                cardSettings={{
                    headerField: "entryno",
                    template: cardTemplate,
                    grabberField: 'color',
                }}
                dataBound={kanbanDataBound}
                dialogOpen={onDialogOpen}
                dialogClose={onDialogClose}
                dialogSettings={{ 
                    template: dialogTemplate,
                    model: { height: '700', width: '1000'},
                    fields: [
                        { key: 'entryno', text: 'ID' },
                        { key: 'worktype1', text: 'Work Type' },
                        { key: 'asgby_name', text: 'Assignor' },
                        { key: 'field_empname', text: 'Assignee' },
                        { key: 'Summary', text: 'Description' },
                        { key: 'asgdt', text: 'Assignment Date' }
                    ]
                }}
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