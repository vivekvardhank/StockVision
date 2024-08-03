import { useState } from "react";
import { TextField, Box, Typography } from '@mui/material';

export default function Search({inventory, setFilteredInventory}){

  const [query, setQuery] = useState('');

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setQuery(value);
    const filteredData = inventory.filter(item => 
      item.name.toLowerCase().includes(value)
    );
    setFilteredInventory(filteredData);
  };

  return (
    <Box>
      <Typography variant="h6">Search</Typography>
      <TextField 
        label="Search"
        value={query}
        onChange={handleSearch}
      />
    </Box>
  );

}