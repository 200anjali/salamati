import React, { createContext, useState, useContext } from 'react';

// Create a new context
const PropsContext = createContext();

// Create a provider component
export const PropsProvider = ({ children }) => {
  const [propsData, setPropsData] = useState(null); // Initialize with an empty object

  const updatePropsData = (newProps) => {
    setPropsData(newProps);
  };

  return (
    <PropsContext.Provider value={{ propsData, updatePropsData }}>
      {children}
    </PropsContext.Provider>
  );
};

// Custom hook to use the props context
export const useProps = () => useContext(PropsContext);