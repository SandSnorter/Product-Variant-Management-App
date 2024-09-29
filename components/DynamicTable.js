"use client";  

import { useState } from 'react';  
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';  

const generateId = () => `id-${Math.random().toString(36).substr(2, 9)}`;  

const DynamicTable = () => {  
  const [states, setStates] = useState([{ productFilter: [], images: {}, rowId: generateId() }]);  
  const [variantColumns, setVariantColumns] = useState([{ title: "Primary Variant" }]);  
  const [openMenuIndex, setOpenMenuIndex] = useState(null); // State for controlling the dropdown menu  

  const addRow = () => {  
    setStates([...states, { productFilter: [], images: {}, rowId: generateId() }]);  
  };  

  const deleteRow = (index) => {  
    setStates(states.filter((_, i) => i !== index));  
  };  

  const addVariantColumn = () => {  
    setVariantColumns([...variantColumns, { title: `Variant ${variantColumns.length + 1}` }]);  
  };  

  const deleteVariantColumn = (index) => {  
    setVariantColumns(variantColumns.filter((_, i) => i !== index));  
    setStates(states.map(state => {  
      const updatedImages = { ...state.images };  
      delete updatedImages[index]; // Remove the images for the deleted variant column  
      return { ...state, images: updatedImages };  
    }));  
  };  

  const handleImageUpload = (event, rowIndex, colIndex) => {  
    const file = event.target.files[0];  
    if (file) {  
      const reader = new FileReader();  
      reader.onload = (e) => {  
        const updatedStates = [...states];  
        updatedStates[rowIndex].images[colIndex] = {  
          src: e.target.result,  
          name: file.name,  
        };  
        setStates(updatedStates);  
      };  
      reader.readAsDataURL(file);  
    }  
  };  

  const handleDragEnd = (result) => {  
    if (!result.destination) return;  

    const reorderedStates = Array.from(states);  
    const [removed] = reorderedStates.splice(result.source.index, 1);  
    reorderedStates.splice(result.destination.index, 0, removed);  

    setStates(reorderedStates);  
  };  

  const toggleMenu = (index) => {  
    setOpenMenuIndex(openMenuIndex === index ? null : index);  
  };  

  return (  
    <div className="p-5">  
      <DragDropContext onDragEnd={handleDragEnd}>  
        <Droppable droppableId="droppable">  
          {(provided) => (  
            <table className="min-w-full" ref={provided.innerRef} {...provided.droppableProps}>  
              <thead>  
                <tr>  
                  <th className="border"></th>  
                  <th className="border">Product Filter</th>  
                  {variantColumns.map((column, colIndex) => (  
                    <th className="border relative" key={colIndex}>  
                      <div className="flex items-center justify-between px-4">  
                        <span className="text-center flex-grow">{column.title}</span>  
                        {colIndex !== 0 && (  
                          <button  
                            onClick={() => toggleMenu(colIndex)}  
                            className="ml-2 mr-2 focus:outline-none"  
                            title="Options"  
                          >  
                            <i className="fa-solid fa-ellipsis-vertical fa-lg"></i>  
                          </button>  
                        )}  
                      </div>  
                      {openMenuIndex === colIndex && (  
                        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white z-10">  
                          <ul className="py-1" aria-labelledby="options-menu">  
                            <li>  
                              <button  
                                onClick={() => {  
                                  deleteVariantColumn(colIndex);  
                                  setOpenMenuIndex(null);  
                                }}  
                                className="block px-4 py-2 text-base text-gray-700 hover:bg-gray-300 w-full text-left font-normal"  
                              >  
                                Delete Variant  
                              </button>  
                            </li>  
                          </ul>  
                        </div>  
                      )}  
                    </th>  
                  ))}
                  <th className="border"></th>  
                </tr>  
              </thead>  
              <tbody>  
                {states.map((state, rowIndex) => (  
                  <Draggable key={state.rowId} draggableId={state.rowId} index={rowIndex}>  
                    {(provided) => (  
                      <tr className='group hover:bg-neutral-200' ref={provided.innerRef} {...provided.draggableProps}>  
                        <td className="border h-64 text-center text-3xl font-bold flex flex-col items-center justify-center relative">  
                          <button  
                            onClick={() => deleteRow(rowIndex)}  
                            className="text-red-500 hover:text-red-700 ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"  
                          >  
                            <i className="fa fa-trash mb-2" aria-hidden="true"></i>  
                          </button>  
                          <div>  
                            <span>{rowIndex + 1}</span>  
                            <i className="fa-solid fa-grip-vertical fa-xs m-1"></i>  
                          </div>  
                        </td>  
                        <td className="border text-center">  
                          <div className='product-cell border-2 border-dashed border-neutral-300 mx-5 bg-white h-48 rounded-lg flex items-center justify-center'>  
                            <div className="flex flex-wrap justify-center items-center">  
                              {state.productFilter.map((tag, i) => (  
                                <span key={i} className="border-2 border-neutral-200 py-2 px-3 rounded mr-1 h-10 flex items-center">  
                                  {tag}  
                                </span>  
                              ))}  
                              <input  
                                type="text"  
                                placeholder="Add Filter"  
                                onKeyDown={(e) => {  
                                  if (e.key === 'Enter' && e.target.value.trim() !== '') {  
                                    const updatedStates = [...states];  
                                    updatedStates[rowIndex].productFilter.push(e.target.value);  
                                    setStates(updatedStates);  
                                    e.target.value = '';  
                                  }  
                                }}  
                                className="border-2 border-neutral-300 rounded-lg p-2 h-10 focus:border-neutral-400 focus:outline-none focus:ring-0"  
                              />  
                            </div>  
                          </div>  
                        </td>  
                        {variantColumns.map((column, colIndex) => (  
                          <td className="border text-center" key={colIndex}>  
                            <div className="border-2 border-dashed border-neutral-300 mx-5 bg-white h-48 rounded-lg flex items-center justify-center relative group">  
                              <input  
                                type="file"  
                                id={`upload-${rowIndex}-${colIndex}`}  
                                className="hidden"  
                                accept="image/*"  
                                onChange={(e) => handleImageUpload(e, rowIndex, colIndex)}  
                              />  
                              {state.images[colIndex] ? (  
                                <div className="relative mt-2 inline-block">  
                                  <img  
                                    src={state.images[colIndex].src}  
                                    alt={state.images[colIndex].name}  
                                    className="w-full h-32 object-cover rounded-lg"  
                                  />  
                                  <span  
                                    className="absolute top-1 right-1 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"  
                                    onClick={() => document.getElementById(`upload-${rowIndex}-${colIndex}`).click()}  
                                  >  
                                    <div className="bg-white p-2 rounded-full shadow-lg">  
                                      <i className="fa-regular fa-pen-to-square text-gray-800 fa-lg"></i>  
                                    </div>  
                                  </span>  
                                  <div className="text-center">  
                                    {state.images[colIndex].name?.replace(/\.(jpg|jpeg|png|gif|jfif)$/i, '') || 'No Name'}  
                                  </div>  
                                </div>  
                              ) : (  
                                <button  
                                  onClick={() => document.getElementById(`upload-${rowIndex}-${colIndex}`).click()}  
                                  className="border border-2 p-2 rounded-lg border-neutral-300"  
                                >  
                                  <i className="fa-solid fa-plus mr-2 fa-md"></i>  
                                  <span>Add Design</span>  
                                </button>  
                              )}  
                            </div>  
                          </td>  
                        ))}  
                        <td className="border text-center">  
                          <button onClick={addVariantColumn} className="border border-2 rounded-lg ml-2 border-neutral-300">
                            <i className="fa-regular fa-plus my-5 mx-3 fa-lg"></i> 
                          </button>  
                        </td>  
                      </tr>  
                    )}  
                  </Draggable>  
                ))}  
                <tr>  
                  <td className="border text-center">  
                    <button onClick={addRow} className="border border-2 p-2 rounded-lg border-neutral-300">
                      <i className="fa-regular fa-plus mx-1.5 my-3.5 fa-lg"></i>
                    </button>  
                  </td>  
                </tr>  
              </tbody>  
            </table>  
          )}  
        </Droppable>  
      </DragDropContext>  
    </div>  
  );  
};  

export default DynamicTable;