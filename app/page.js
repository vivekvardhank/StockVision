'use client';
import { useState, useEffect, useRef, useCallback } from "react";
import { firestore } from '@/firebase';
import { Box, Typography, Button, TextField, IconButton, Card, CardHeader,CardContent, CardActions, Grid, Container, AppBar, Toolbar, Stack, Backdrop, CircularProgress,useMediaQuery, useTheme} from '@mui/material';
import { collection, getDocs, addDoc, deleteDoc, updateDoc, doc } from "firebase/firestore";
import Search from './components/search';
import Webcam from "react-webcam";
import axios from 'axios';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import FlipCameraIosIcon from '@mui/icons-material/FlipCameraIos';
import Image from 'next/image';


export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemCount, setNewItemCount] = useState('');
  const [addTheItem, setAddTheItem] = useState(false);
  const [updateId, setUpdateId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editCount, setEditCount] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const [error, setError] = useState('');
  const [activeItemId, setActiveItemId] = useState(null);
  const [iscapture,setIsCapture]=useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [useBackCamera, setUseBackCamera] = useState(false);
  const [recipe, setRecipe] = useState(null);
  const [steps, setSteps] = useState(null);
  const [recipeLoading,setRecipeLoading]=useState(false);
  const [recipeError,setRecipeError]=useState(false);
  

  const webcamRef = useRef(null);
  const theme = useTheme();
  const isSmallDevice = useMediaQuery(theme.breakpoints.down('sm'));


  useEffect(() => {
    const checkCameras = async () => {
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        const hasBack = videoDevices.some(device => device.label.toLowerCase().includes('back'));
        if(!hasBack){
          setUseBackCamera(false);
        }
      } catch (err) {
        console.error('Error checking cameras:', err);
        setError('Error checking cameras');
      }
    };
  
    if (showCamera) {
      checkCameras();
    }
  }, [showCamera,useBackCamera]);
  
  
  const getRecipe= async()=>{
    setRecipeLoading(true);
     setRecipe(null);
    setRecipeError(false);
    try{

    const result = inventory.reduce((acc, item) => {
    const name = item.name.trim();
    const count = parseInt(item.count, 10);
    acc[name] = count;
    return acc;
    }, {});
      
    const response = await axios.post('/api/recipes', result);
    if (response && response.data) {
      const data = response.data;
      const recipe = data.recipe;
      console.log(recipe)
      setRecipe(recipe);
      const steps = [];
      const descriptionLines = recipe.description.split('\n');
      descriptionLines.forEach(line => {
      const match = line.match(/^(\d+)\.\s(.+)$/);
     if (match) {
        const stepNumber = parseInt(match[1], 10) - 1; 
        const stepText = match[2];
        steps[stepNumber] = stepText;
      }
    });
      setSteps(steps);
      setRecipeLoading(false)
      
    } 
  } catch (error) {
    console.error("Error fetching recipe:", error);
    setRecipeLoading(false)
    setRecipeError(true)
  }
};






  const capture = async () => {
    const imageSrc = capturedImage;
    if (imageSrc) {
      const base64Image = imageSrc.split(',')[1];
      setIsLoading(true);
      try {
        const response = await axios.post('/api/vision', { imageBase64: base64Image });
        const { name } = response.data;
        setNewItemName(name);
        setShowCamera(false);
        setIsCapture(false);
        setCapturedImage(null)
      } catch (error) {
        console.error(`item not found ${error}`);
        setError('Item not found. Please try again.');
        setIsCapture(false);
        setCapturedImage(null);
        setError('Retry...')
      }finally {
        setIsLoading(false); 
      }
    }
  };


  const verifyCapture = useCallback(async () => {
    setError('')
    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      setCapturedImage(imageSrc)
      setIsCapture(true);
      
    }
  }, [webcamRef]);


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.inventory-item') && !event.target.closest('.item-actions')) {
        setActiveItemId(null);
      }
    };
  
    document.addEventListener('click', handleClickOutside);
  
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);
  
  
  


  const updateInventory = async () => {
    const snapshot = await getDocs(collection(firestore, 'inventory'));
    const inventoryList = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    setInventory(inventoryList);
    setFilteredInventory(inventoryList);
  };

  const addItem = async () => {
    if (!newItemName || !newItemCount) {
      setError('Both fields are required');
      return;
    }
    setError('');
    if (newItemName && newItemCount) {
      const existingData = inventory.filter(item =>
        item.name.toLowerCase() === newItemName.toLowerCase()
      );
    if (existingData.length > 0) {
        setError('Item with same name already exists');
        return;
     }
    }
    if (newItemName && newItemCount) {
      await addDoc(collection(firestore, 'inventory'), {
        name: newItemName,
        count: newItemCount
      });
      setNewItemName('');
      setNewItemCount('');
      updateInventory();
      setAddTheItem(false);
      setShowCamera(false);
      setIsCapture(false);
      setCapturedImage(null)
    }
  };

  const removeItem = async (id) => {
    await deleteDoc(doc(firestore, 'inventory', id));
    updateInventory();
  };

  const updateItemCount = async (id, newName, newCount) => {
    if (Number(newCount) < 0) {
      return;
    }
    await updateDoc(doc(firestore, 'inventory', id), {
      name: newName,
      count: newCount
    });
    updateInventory();
  };

  const handleEdit = (item) => {
    setUpdateId(item.id);
    setEditName(item.name);
    setEditCount(item.count);
  };

  const saveEdit = async (id) => {
    await updateDoc(doc(firestore, 'inventory', id), {
      name: editName,
      count: Number(editCount)
    });
    setUpdateId(null);
    updateInventory();
  };

  const toggleItemActions = (id,e) => {
    e.stopPropagation();
    setActiveItemId(activeItemId === id ? null : id);
  };

  useEffect(() => {
    updateInventory();
  }, []);

  return (
    <Box>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Stock vision
          </Typography>
        </Toolbar>
      </AppBar>
      <Container>
        <Box sx={{ my: 4 }}>
          <Search inventory={inventory} setFilteredInventory={setFilteredInventory} />
          {!addTheItem && (
            <Button
              variant="contained"
              color="primary"
              onClick={() => { setAddTheItem(true); setNewItemCount(''); setError(''); }}
              startIcon={<AddIcon />}
              sx={{ mb: 2 ,mt: 1}}
            >
              Add Item
            </Button>
          )}
          {addTheItem && (
            <Box sx={{ mb: 2,mt:2 }}>
              <Typography variant="h6">Add Inventory</Typography>
              <TextField
                label="Item Name"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                sx={{ mr: 2, mb: 1 }}
              />
              <TextField
                label="Item Count"
                type="number"
                value={newItemCount}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value < 0) {
                    setNewItemCount('0');
                  } else {
                    setNewItemCount(value);
                  }
                }}
                sx={{ mr: 2, mb: 1 }}
              />
              <Stack direction="row" spacing={2} >
              <Button
                variant="contained"
                color="primary"
                onClick={addItem}
                sx={{ mr: 2 }}
              >
                Add
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => { setAddTheItem(false), setShowCamera(false), setNewItemName('') }}
                sx={{ mr: 2 }}
              >
                Cancel
              </Button>
              <IconButton
                color="primary"
                onClick={() => setShowCamera(true)}
              >
                <CameraAltIcon />
              </IconButton>
              </Stack>
              
              {error && <Typography color="error">{error}</Typography>}
            </Box>
          )}
          {showCamera && (
            <Box sx={{ mb: 2, 
              width: '100%', 
              maxWidth: '640px', 
              marginBottom: '30px',
              '@media (max-width: 960px)': {
                maxWidth: '480px'  
              },
              '@media (max-width: 600px)': {
                maxWidth: '100%'   
              } }} >
              <Stack spacing={1}>
             {!iscapture && !capturedImage &&
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                style={{ marginBottom: '10px' }}
                videoConstraints={{
                  facingMode: useBackCamera ? { exact: "environment" } : "user"
                }}
              />
              }
              {iscapture && capturedImage &&
               <Box sx={{ position: 'relative', width: '100%' }}>
               <Image src={capturedImage} alt="Captured" style={{ marginBottom: '10px' }} />
               {isLoading && (
                 <Backdrop
                   sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                   open={isLoading}
                 >
                   <CircularProgress color="inherit" />
                 </Backdrop>
               )}
             </Box>
              }
              <Stack direction="row" spacing={2} justifyContent="center">
              { !iscapture && <Box>
              <Button
                variant="contained"
                color="primary"
                onClick={verifyCapture}
                sx={{ mr: 2 }}
              >
                Capture
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => {setShowCamera(false),setError('')}}
              >
                Cancel
              </Button>
              <IconButton
                  color="primary"
                  onClick={() => {setUseBackCamera(prevState => !prevState), setError('')}}
                  sx={{ ml: 2 }}
                >
                <FlipCameraIosIcon />
                </IconButton>
              </Box>}
              { iscapture && <Box>
              <Button
                variant="contained"
                color="primary"
                onClick={capture}
                sx={{ mr: 2 }}
              >
                Confirm
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => {setIsCapture(false),setCapturedImage(null)}}
              >
                Retake
              </Button>
              </Box>}

              </Stack>
              </Stack>
            
            </Box>
          )}
          <Typography variant="h4" sx={{ mb: 2}}>Inventory</Typography>
          {filteredInventory.length === 0 ? (
            <Typography>No items</Typography>
          ) : (
            <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
              {filteredInventory.map((item) => (
                <Grid item xs={12} sm={6} md={4} key={item.id}  >
                  <Card>
                    <CardContent >
                      {updateId === item.id ? (
                        <Box>
                          <TextField
                            label="Item Name"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            sx={{ mr: 2, mb: 1 }}
                          />
                          <TextField
                            label="Item Count"
                            type="number"
                            value={editCount}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value >= 0) {
                                setEditCount(value);
                              }
                            }}
                            sx={{ mr: 2, mb: 1 }}
                          />
                          <Stack direction="row" spacing={1}>
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() => saveEdit(item.id)}
                            sx={{ mr: 2 }}
                          >
                            Save
                          </Button>
                          <Button
                            variant="outlined"
                            color="secondary"
                            onClick={() => setUpdateId(null)}
                          >
                            Cancel
                          </Button>
                          </Stack>
                        </Box>
                      ) : (
                        <Box>
                          <Box className="inventory-item" onClick={(e) => toggleItemActions(item.id,e)} sx={{ cursor: 'pointer' }}>
                            <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={1}>
                              <Typography variant="h6">{item.name}</Typography>
                              <Typography variant="h6">{`Quantity : ${item.count}`}</Typography>
                            </Stack>
                          </Box>
                          {activeItemId === item.id && (
                            <CardActions  className="item-actions" sx={{ display: 'flex', justifyContent: 'space-between', backgroundColor:'lightgrey', marginTop:'14',borderRadius:'20px', marginBottom:'-20px' }} onClick={(e) => e.stopPropagation()}>
                              <IconButton
                                color="primary"
                                onClick={(e) => {e.stopPropagation(); updateItemCount(item.id, item.name, String(Number(item.count) + 1))}}
                              >
                                <AddIcon />
                              </IconButton>
                              <IconButton
                                color="secondary"
                                onClick={(e) =>{e.stopPropagation(); updateItemCount(item.id, item.name, String(Number(item.count) - 1))}}
                              >
                                <RemoveIcon />
                              </IconButton>
                              <IconButton
                                color="primary"
                                onClick={(e) => {e.stopPropagation();handleEdit(item)}}
                              >
                                <EditIcon />
                              </IconButton>
                              <IconButton
                                color="error"
                                onClick={(e) => {e.stopPropagation();removeItem(item.id)}}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </CardActions>
                          )}
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
          { filteredInventory.length !== 0 && <Box sx={{ mt: 5, display: 'flex', justifyContent: isSmallDevice ? 'center' : 'flex-start'}}>
      <Box sx={{ width: '80%', maxWidth: 800 }}>
        <Typography variant="h6">
          Why don&apos;t you try out some recipes?
        </Typography>
        <Box sx={{ display: 'flex',  mt: 2 , gap:3}}>
          <Button variant="contained" color="primary" onClick={getRecipe}>
            Get recipes
          </Button>
          { recipe &&
          <Button variant="outlined"  onClick={()=>{setRecipe(null), setSteps(null), setRecipeError(false)}}>
             Clear
          </Button>
           }

        </Box>
        {recipeLoading && <Typography variant="h6" sx={{mt:4,ml:4}}>...Loading</Typography>}
        {recipeError && <Typography variant="h6" sx={{mt:4,ml:4, color:'red'}}>Try again</Typography> }

        {recipe && (
          <Card sx={{ mt: 5, boxShadow: 3, width: '100%', maxWidth: 800 }}>
          <CardHeader
            title={recipe.recipe_name}
            titleTypographyProps={{ variant: 'h4', align: 'center' }}
            sx={{ backgroundColor: '#f5f5f5', py: 2 }}
          />
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Ingredients:</Typography>
            <Box component="ul" sx={{ pl: 3, mb: 3 }}>
              {Object.entries(recipe.items).map(([item, quantity], index) => (
                <Box component="li" key={index} sx={{ mb: 1 }}>
                  <Typography variant="body1">{item}: {quantity}</Typography>
                </Box>
              ))}
            </Box>
            <Typography variant="h6" sx={{ mb: 2 }}>Step-by-step instructions:</Typography>
              <Box component="ol" sx={{ pl: 3 }}>
                    {steps.map((step, index) => (
                   <Box component="li" key={index} sx={{ mb: 1 }}>
                  <Typography variant="body1">{step}</Typography>
              </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
         )}
        </Box>
       </Box>}


        </Box>
      </Container>
    </Box>
  );
}
