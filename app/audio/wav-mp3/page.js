"use client"

import React, { useState, useEffect  } from 'react';
import axios from 'axios';
import { FaAngleDown, FaAngleUp  } from 'react-icons/fa';
import { AiOutlineCloseCircle } from 'react-icons/ai';
import { AiOutlineRight } from 'react-icons/ai';
import { FaFolder  } from 'react-icons/fa';

import { BsArrowRight } from 'react-icons/bs';
import { BiDownload } from 'react-icons/bi';
import { BsBoxArrowUpRight } from 'react-icons/bs';
import JSZip from 'jszip';
import { BsFillLockFill } from 'react-icons/bs';
import { FaFileUpload } from 'react-icons/fa';
import Footer from '@/app/footer/footer';
import Navbar from '@/app/navbar/Navbar';
function App() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  

  const validFormats = {
  validImages :['png', 'jpeg', 'svg', 'ico', 'gif', 'psd', 'webp', 'bmp', 'WAV', 'tiff', 'jpeg', 'tga', 'ico', 'eps'],
  validMP3 : ['MP3'],
  validExcel : ['xlsx','xls','excel'],
  validMicro : ['html',  'odt',   'word', 'doc', 'docx',  'odt',  'ppt', 'pptx','rtf'],
  validEbook : ['epub' , 'azw3' , 'mobi'],
  validTxt :['text' , 'txt' ],
  
  validVidoAudio : [
  
    'mov', '3gp', 'mp4', 'flv', 'mkv', 'avi', 'ogv', 'webm', 'wmv','gif','mpg','mpeg','m4v','mjpeg','hevc','swf','ts','vob','3g2','m2v','mts',
    'mp3', 'WAV', 'amr', 'WAV', 'aac', 'wav', 'wma', 'flac', 'm4a', 'WAV','mp2','oga',
  ],
    validDevives :['xbox', 'mobile', 'kindle', 'ipad', 'android', 'psp', 'iphone'],
  // these will use for just for chose the right library
  image_svg:['png', 'jpeg',  'ico', 'gif', 'psd', 'webp' ,'bmp', 'WAV', 'tiff', 'jpeg', 'tga', 'ico', 'eps','MP3'],
  svg:['svg'],
  imagesDocx:['doc' , 'word','docx' ,'excel', 'ppt', 'pptx' , 'xlsx','xls'],
  html:['html'],
  imagesTxt:['txt','text'],
  Txt:['txt','text','odt','ps' ,],
  micro:['doc' , 'docx' ,'word', 'ppt', 'pptx' ,'excel', 'xlsx','xls','csv','xml'],
  ebook:['epub' , 'azw3' , 'mobi'],
  MergeExcel:['csv' , 'xml' , 'MP3','rtf','odt','png', 'jpeg',],
  MergeMicro:[ 'MP3','rtf','odt','png', 'jpeg',],


  }
  
  const [files, setSelectedFiles] = useState([]);
  const [conversionProgress, setConversionProgress] = useState({});
  const [convert, setConvert] = useState([]);
  const [type, setType] = useState([]);
  const [globalSelectedFormat, setGlobalSelectedFormat] = useState('');
  const [individualSelectedFormats, setIndividualSelectedFormats] = useState({});

  const [totalConversionProgress, setTotalConversionProgress] = useState({});

  const[chose , setChose] = useState({})
  const [showConvertChoseMap, setShowConvertChoseMap] = useState({});
  const [isHovered, setIsHovered] = useState(false);

const [convertedFiles ,  setCovertedFiles] = useState(false);


const [downloadAll, setDownloadAll] = useState();
const [downloadValidation , setDownloadValidation]=useState(true)
 
const [defaultProgress , setDefaultProgress] = useState(0)
 

  const handleDragOver = (e) => {
    e.preventDefault();
  };






const handleFileChange1 = (event, newFiles) => {
  const updatedFiles = [...files];
  const updatedFormats = { ...individualSelectedFormats };
  let newIndex = files.length; // Starting index for new files

  newFiles.forEach((newFile, i) => {
    updatedFiles.push(newFile); // Add the new file
    const fileExtension = newFile.name.split(".").pop();
    const index = newIndex + i; // Calculate the index
    updatedFormats[`${newFile.name}_${index}`] = fileExtension; // Set default format for new file
  });

  event.target.value = '';
  setSelectedFiles(updatedFiles);
  setIndividualSelectedFormats(updatedFormats);
};

const handleFileChange = (event) => {
  const newFiles = Array.from(event.target.files);
  handleFileChange1(event, newFiles);
};

const handleDrop = (e) => {
  e.preventDefault();
  const newFiles = Array.from(e.dataTransfer.files);
  handleFileChange1(e, newFiles);
};








 
  const handleFileDelete = (fileName) => {
    const indexToDelete = files.findIndex((file, index) => `${file.name}_${index}` === fileName);
    
    if (indexToDelete === -1) {
      // File not found
      return;
    }
  
    const updatedFiles = files.filter((file, index) => index !== indexToDelete);
    
    // Update indexes in individualSelectedFormats after deletion
    const updatedFormats = {};
    updatedFiles.forEach((file, index) => {
      const newIndex = index;
      const oldIndex = index < indexToDelete ? index : index + 1;
      const oldFileKey = `${file.name}_${oldIndex}`;
      updatedFormats[`${file.name}_${newIndex}`] = individualSelectedFormats[oldFileKey];
    });
    
    setSelectedFiles(updatedFiles);
    setIndividualSelectedFormats(updatedFormats);
  
    if (updatedFiles.length === 0) {
      window.location.reload();
    }
  };
  
  

// this for reload time 
  useEffect(() => {
    const deleteFilesOnUnload = () => {
      if (convert.length > 0) {
        console.log('we are reloading ')
        convert.filter((c) => type.includes(c.fileOutput)).forEach((c) => {
          axios
            .delete(`${apiUrl}/delete/${c._id}`)
            .then(() => {
              console.log('File deleted successfully');
            })
            .catch((error) => {
              console.log('An error occurred while deleting the file:', error);
            });
        });
      }
    };

    window.addEventListener('beforeunload', deleteFilesOnUnload);

    return () => {
      window.removeEventListener('beforeunload', deleteFilesOnUnload);
    };
  }, [convert, type]);

console.log('files' , files)


const handleFileUpload = async (e) => {
  try {
    if (files.length === 0) {
      alert('Please select one or more video files first.');
      return;
    }
    

    setCovertedFiles(true);

    // const typeArray = files.map((file, index) => {
    //   const fileType = file.name + Date.now() + "output." + (individualSelectedFormats[`${file.name}_${index}`]);
    
    //   return fileType;
    // });
    const sanitizeFileName = (fileName) => {
      // Replace problematic symbols with underscores
      return fileName.replace(/[ %&?#<>/\\+:;=]/g, '_');
    };
    
    
    const typeArray = files.map((file, index) => {
      const sanitizedFileName = sanitizeFileName(file.name);
      const formatMappings = {
        word: 'docx',
        excel: 'xlsx',
        // Add more mappings as needed
      };
      
      const format = individualSelectedFormats[`${file.name}_${index}`].toLowerCase();
      const convertType = formatMappings[format] || format;
      
      const fileType = sanitizedFileName + Date.now() + "output." + convertType;
      
      return fileType;
    });
    
    setType(typeArray);

    await Promise.all(files.map(async (file, index) => {
      const formData = new FormData();
      formData.append('files', file);
      // formData.append('convertType', individualSelectedFormats[`${file.name}_${index}`].toLowerCase());
      
      const formatMappings = {
        word: 'docx',
        excel: 'xlsx',
        // Add more mappings as needed
      };
      
      const format = individualSelectedFormats[`${file.name}_${index}`].toLowerCase();
      const convertType = formatMappings[format] || format;
      
      formData.append('convertType', convertType);
      
      formData.append('fileOutput', typeArray[index]);
      // formData.append('filename', file.name.split(".")[0]);
      
      
      formData.append('filename', `${file.name}_${index}`);

      const fileName = file.name;
      const fileExtension = fileName.split('.').pop().toLowerCase();
      const formatChose = individualSelectedFormats[`${fileName}_${index}`].toLowerCase();

      let uploadUrl = '';

      if (validFormats.validImages.includes(fileExtension)) {
        if (validFormats.image_svg.includes(formatChose)) {
          uploadUrl = `${apiUrl}/images_svg`;
        } else if (validFormats.svg.includes(formatChose)) {
          uploadUrl = `${apiUrl}/svg`;
        } else if (validFormats.imagesDocx.includes(formatChose)) {
          uploadUrl = `${apiUrl}/imagesDocx`;
        } else if (validFormats.Txt.includes(formatChose)) {
          uploadUrl = `${apiUrl}/imagesTxt`;
        } else if (validFormats.html.includes(formatChose)) {
          uploadUrl = `${apiUrl}/html`;
        }
      } else if (validFormats.validMP3.includes(fileExtension)) {
        if (validFormats.image_svg.concat(validFormats.svg).includes(formatChose)) {
          uploadUrl = `${apiUrl}/office`;
        } else if (validFormats.micro.includes(formatChose)) {
          uploadUrl = `${apiUrl}/micro`;
        } else if (validFormats.Txt.includes(formatChose)) {
          uploadUrl = `${apiUrl}/txt`;
        } else if (validFormats.html.includes(formatChose)) {
          uploadUrl = `${apiUrl}/html`;
        } else if (validFormats.ebook.includes(formatChose)) {
          uploadUrl = `${apiUrl}/ebook`;
        }
      } else if (validFormats.validExcel.includes(fileExtension)) {
        if (validFormats.MergeExcel.includes(formatChose)) {
          uploadUrl = `${apiUrl}/office`;
        } else if (validFormats.Txt.includes(formatChose)) {
          uploadUrl = `${apiUrl}/txt`;
        }
      } else if (validFormats.validMicro.includes(fileExtension)) {
        if (validFormats.MergeMicro.includes(formatChose)) {
          uploadUrl = `${apiUrl}/office`;
        } else if (validFormats.Txt.includes(formatChose)) {
          uploadUrl = `${apiUrl}/txt`;
        }
      } else if (validFormats.validTxt.includes(fileExtension)) {
        if (validFormats.image_svg.concat(validFormats.svg).concat(validFormats.MergeExcel).includes(formatChose)) {
          uploadUrl = `${apiUrl}/office`;
        } else if (validFormats.imagesDocx.includes(formatChose)) {
          uploadUrl = `${apiUrl}/micro`;
        } else if (validFormats.html.includes(formatChose)) {
          uploadUrl = `${apiUrl}/html`;
        }
      } else if (validFormats.validVidoAudio.includes(fileExtension)) {
        if (validFormats.validVidoAudio.includes(formatChose)) {
          uploadUrl = `${apiUrl}/videoAudio`;
        } else if (validFormats.validDevives.includes(formatChose)) {
          uploadUrl = `${apiUrl}/videoAudio`;
        }
      } else if (validFormats.validDevives.includes(fileExtension)) {
        if (validFormats.validDevives.includes(formatChose)) {
          uploadUrl = `${apiUrl}/videoAudio`;
        }
      } else {
        if (validFormats.micro.includes(formatChose)) {
          uploadUrl = `${apiUrl}/micro`;
        } else if (validFormats.MergeExcel.concat(validFormats.image_svg).includes(formatChose)) {
          uploadUrl = `${apiUrl}/office`;
        } else if (validFormats.Txt.includes(formatChose)) {
          uploadUrl = `${apiUrl}/txt`;
        } else if (validFormats.html.includes(formatChose)) {
          uploadUrl = `${apiUrl}/html`;
        }
      }

      if (uploadUrl) {
        await handleUpload(uploadUrl, formData, fileName);
      }
      const res = await axios.get(`${apiUrl}/get`);
      setConvert(res.data);


      setTimeout(() => {
        
          window.location.reload();
          return;
        
      },    2 *60 * 60 * 1000);
     
    }));
  } catch (error) {
    console.log('An error occurred during the conversion:', error);
  }
};

const handleUpload = async (url, formData, fileName) => {
  try {
    const response = await axios.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded / progressEvent.total) * 100);
        setConversionProgress((prevProgress) => ({
          ...prevProgress,
          [fileName]: percentCompleted,
        }));
      },
    });
    console.log('File uploaded:', fileName);
    return response;
  } catch (error) {
    console.log('An error occurred during the upload of', fileName, ':', error);
    throw error;
  }
};
  
  console.log( 'this type', type)
  console.log( 'this convert', convert)
  useEffect(() => {
   
    const checkConversionProgress = async () => {
      try {
        // this is for JS code start
        const responseVideoAudio = await axios.get(`${apiUrl}/progressVideoAudio`);
        const progress0 = responseVideoAudio.data.progress;

        // const responseDevice = await axios.get('${apiUrl}/progressDevice');
        // const progress11 = responseDevice.data.progress;

        const responseImageTxt = await axios.get(`${apiUrl}/progressImageTxt`);
        const progress1 = responseImageTxt.data.progress;
    
        const responseEbook = await axios.get(`${apiUrl}/progressEbook`);
        const progress2 = responseEbook.data.progress;

        const responseOffice = await axios.get(`${apiUrl}/progressOffice`);
        const progress3 = responseOffice.data.progress;

        // this is for JS code end 

        // this is for PY  code start
        const responseHtml = await axios.get(`${apiUrl}/progressHtml `);
        const progressHtml = responseHtml.data.progress;

        const responseImage = await axios.get(`${apiUrl}/progressImage`);
        const progressImage = responseImage.data.progress;

        const responseSvg = await axios.get(`${apiUrl}/progressSvg`);
        const progressSvg = responseSvg.data.progress;

        const responseImageDocx = await axios.get(`${apiUrl}/progressImageDocx`);
        const progressImageDocx = responseImageDocx.data.progress;

        const responseMicro = await axios.get(`${apiUrl}/progressMicro`);
        const progressMicro = responseMicro.data.progress;

        const responseTxt = await axios.get(`${apiUrl}/progressTxt`);
        const progressTxt = responseTxt.data.progress;

        
        // this is for PY  code end

        

    


        setTotalConversionProgress({ ...progress0,...progress1, ...progress2  ,
          ...progress3 , ...progressHtml , ...progressImage , ...progressImageDocx , ...progressMicro , 
        ...progressSvg , ...progressTxt
        });

        // setTotalConversionProgress(res.data.total);
        console.log('responseImageTxt',responseImageTxt)

      } catch (error) {
        console.log('Error while checking conversion progress:', error);
      }
    };

    const progressCheckInterval = setInterval(checkConversionProgress, 1000);

    return () => {
      clearInterval(progressCheckInterval);
    };
  }, []);


  // const handleDeleteInProgress = async (c) => {
  //   try {
  //     // Send a delete request to the server to delete the file by ID
  //     // setTotalConversionProgress((prevProgress) => {
  //     //   const updatedProgress = { ...prevProgress };
  //     //   delete updatedProgress[c.fileOutput];
  //     //   return updatedProgress;
  //     // });
  
  //     setType((prevType) => prevType.filter((fileOutputType) => fileOutputType !== c));
  //     // we  create new   Array  based on this  condition by using filtering we
  //     // Say  but on Array  all  component  just  who  does  not equal c
     
  //   } catch (error) {
  //     console.log('An error occurred while deleting the file:', error);
  //   }
  // };
  

const [downloadOne , setDownloadOne] = useState(false)
const [downloadOne1 , setDownloadOne1] = useState(false)
const handleDownload = async (c) => {
  try {
    if (files.length === 1) {
      setDownloadOne1(true);
    }

    setDownloadOne(true);

    const response = await axios.get(`${apiUrl}/api/download?fileName=${c.fileOutput}`, {
      responseType: 'blob'
    });

    const downloadUrl = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = downloadUrl;
  
    link.setAttribute('download', `${c.filename.split('.')[0]}.${c.convertType}`); // Adjust filename if needed
    document.body.appendChild(link);
    link.click();
    link.remove();

    // Delay the execution of these calls to wait for the download to complete
    setTimeout(() => {
      setDownloadOne(false);
      setDownloadOne1(false);
    }, 1000); // Assuming the download takes less than 5 seconds, adjust if needed

    // Delete the file after 2 hours
    setTimeout(() => {
      axios
        .delete(`${apiUrl}/delete/${c._id}`)
        .then(() => {
          console.log('File deleted successfully');
        })
        .catch((error) => {
          console.log('An error occurred while deleting the file:', error);
        });
    }, 2 * 60 * 60 * 1000);
  } catch (error) {
    console.error('Error downloading file:', error);
  }
};


  const DownloadAll = () => {
    const filesToDownload = convert.filter((c) => type.includes(c.fileOutput));
  
    // Create a new instance of JSZip
    setDownloadValidation(false);
    const zip = new JSZip();
  
    // Counter to keep track of downloaded files
    let downloadedFilesCount = 0;
  
    filesToDownload.forEach((down) => {
      axios
        .get(`${apiUrl}/api/download?fileName=${down.fileOutput}`, {
          responseType: 'blob'
        })
        .then(async (response) => {
          const downloadUrl = window.URL.createObjectURL(new Blob([response.data]));
          const filename = `${down.filename.split('.')[0]}.${down.convertType}`;
          const fileType = 'blob';
  
          // Download the file
          const fileResponse = await axios.get(downloadUrl, { responseType: fileType });
          // Add file to the zip
          zip.file(filename, fileResponse.data);
  
          // Increment downloaded files count
          downloadedFilesCount++;
  
          // Check if all files are downloaded
          if (downloadedFilesCount === filesToDownload.length) {
            // Generate the zip
            zip.generateAsync({ type: 'blob' }).then((content) => {
              // Create a temporary anchor element to download the zip
              const downloadAnchor = document.createElement('a');
              downloadAnchor.href = URL.createObjectURL(content);
              downloadAnchor.download = 'downloadedFiles.zip';
              downloadAnchor.click();
  
              // Set download validation to true when the download folder is shown to the user
              setDownloadValidation(true);
            });
          }
  
          // Delete the file after it's added to the zip
          setTimeout(() => {
            axios
              .delete(`${apiUrl}/delete/${down._id}`)
              .then(() => {
                console.log('File deleted successfully');
              })
              .catch((error) => {
                console.log('An error occurred while deleting the file:', error);
              });
          }, 2 * 60 * 60 * 1000);
        })
        .catch((error) => {
          console.log('An error occurred while downloading the file:', error);
        });
    });
  };
  



let availableFormats = {};

files.forEach((file) => {
  const fileName = file.name;
  const fileExtension = fileName.split('.').pop().toLowerCase();

  // Initialize available formats array for the current file
  let fileAvailableFormats = [];
  if (validFormats.validImages.includes(fileExtension)) {

    // Your code for the condition when 'fileName' contains valid formats
   
    
    fileAvailableFormats = [{
      
      category:[{la:"Image"},{la:"Document"},],
      Image: ['PNG', 'JPEG', 'SVG', 'ICO', 'GIF', 'PSD', 'WEBP', 'BMP', 'WAV', 'TIFF', 'JPEG', 'TGA', 'ICO', 'EPS'],
      Document: ['TXT', 'TEXT', 'MP3', 'WORD', 'DOC', 'DOCX', 'HTML', 'EXCEL','PPT', 'PPTX', 'XLSX', 'XLS'],


    }
  
  ];


  } 
  
  else if (validFormats.validMP3.includes(fileExtension)) {

    
    fileAvailableFormats = [{
      category:[{la:"Image"},{la:"Document"},{la:"Ebook"}],
      Document: ['TXT', 'TEXT', 'PS', 'MP3', 'WORD', 'DOC', 'DOCX', 'EXCEL', 'XLSX', 'XLS', 'ODT', 'PPT', 'PPTX', 'RTF', 'EPUB', 'AZW3', 'MOBI', 'HTML'],
      Image: ['PNG', 'JPEG', 'SVG', 'ICO', 'GIF', 'PSD', 'WEBP', 'BMP', 'WAV', 'TIFF', 'TGA', 'ICO', 'EPS'],
      Ebook :['EPUB' , 'AZW3' , 'MOBI']

    }
  
  ];
  }


  else if (validFormats.validExcel.includes(fileExtension)) {
    fileAvailableFormats = [
{   
  category:[{la:"Image"},{la:"Document"},],
  Document: ['CSV', 'XML', 'MP3', 'ODT', 'RTF', 'TEXT', 'TXT'],
  Image: ['PNG', 'JPEG','GIF',],
  
}   ];    
   

 }


 else if (validFormats.validMicro.includes(fileExtension)) {
  fileAvailableFormats = [

    {   
      category:[{la:"Image"},{la:"Document"},],
      Document: ['MP3', 'ODT', 'PS', 'RTF', 'TEXT'],
      Image: ['PNG', 'JPEG','GIF',],
      
    }

  
 ];    
 

}

else if (validFormats.validEbook.includes(fileExtension)) {
  fileAvailableFormats = [
    {   
      category:[{la:"Document"},{la:"Image"}],
      Document: ['MP3', 'TXT', 'DOCX', 'DOC', 'WORD', 'XLSX', 'XLS', 'EXCEL', 'HTML', 'PPT', 'PPTX'],
      Image: ['PNG', 'JPEG','GIF',],
    
    }
   
 ];    
 

}

else if (validFormats.validTxt.includes(fileExtension)) {
  fileAvailableFormats = [

    {   
      category:[{la:"Image"},{la:"Document"},],
      Document: ['MP3', 'TXT', 'TEXT', 'DOCX', 'DOC', 'WORD', 'XLSX', 'XLS', 'EXCEL', 'HTML', 'PPT', 'PPTX'],
      Image: ['PNG', 'JPEG', 'SVG', 'ICO', 'GIF', 'PSD', 'WEBP', 'BMP', 'WAV', 'TIFF', 'TGA', 'ICO', 'EPS'],
      
    }



 ];    
 

}
else if (validFormats.validVidoAudio.includes(fileExtension)) {
  fileAvailableFormats = [


    {   
      category:[{la:"Audio"},{la:"Video"},{la:'Image'}],
      Audio: ['MP3', 'WAV', 'AAC', 'WMA', 'FLAC', 'M4A', 'MP2', 'OGA'],
Video: ['MOV', 'MP4', 'FLV', 'MKV', 'AVI', 'WEBM', 'WMV',  'OGV', 'MPG', 'MPEG', 'M4V', 'MJPEG', 'HEVC', 'SWF', 'TS', 'VOB'],
Image:['GIF'],
      // Device:['xbox', 'mobile', 'kindle', 'ipad', 'Android', 'PSP', 'iphone'],
   
    }



    
    


 ];    
 

}
  
// else if (validFormats.validDevives.includes(fileExtension)) {
//   fileAvailableFormats = [
//     {
//       Device:['xbox', 'mobile', 'kindle', 'ipad', 'Android', 'PSP', 'iphone'],

//     }
// ];    

// }
  
  else {
    
    // Your code for the condition when 'fileName' does not contain valid formats
    fileAvailableFormats = [
      {   
        category:[{la:"Image"},{la:"Document"},],
        Document: ['MP3', 'TXT', 'TEXT', 'DOCX', 'DOC', 'WORD', 'XLSX', 'XLS', 'EXCEL', 'HTML', 'PPT', 'PPTX'],
        Image: ['PNG', 'JPEG','GIF' ],
        
      }
    ];

  }

  // Store available formats for the current file in the object
  availableFormats[fileName] = fileAvailableFormats;


});
// const [showConvertChoseMap, setShowConvertChoseMap] = useState({});










// Step 1: Identify all unique categories across all files
let allCategories = [];

files.forEach((file) => {
  const fileName = file.name;
  const fileAvailableFormats = availableFormats[fileName];

  fileAvailableFormats.forEach((formatObj) => {
    formatObj.category.forEach((categoryObj) => {
      const category = categoryObj.la;
      if (!allCategories.includes(category)) {
        allCategories.push(category);
      }
    });
  });
});

// Step 2: Determine shared formats for each category
let selectAll = [];

allCategories.forEach((category) => {
  let sharedFormats = null;
  let isFirstFile = true;

  files.forEach((file) => {
    const fileName = file.name;
    const fileAvailableFormats = availableFormats[fileName];
    let categoryFound = false;

    fileAvailableFormats.forEach((formatObj) => {
      formatObj.category.forEach((categoryObj) => {
        if (categoryObj.la === category) {
          const formats = formatObj[category];
          if (isFirstFile) {
            sharedFormats = [...formats];
            isFirstFile = false;
          } else {
            sharedFormats = sharedFormats.filter((format) => formats.includes(format));
          }
          categoryFound = true;
        }
      });
    });

    // If category not found in a file, reset sharedFormats
    if (!categoryFound) {
      sharedFormats = [];
    }
  });

  // Add the shared category and formats to selectAll array if sharedFormats is not empty
  if (sharedFormats && sharedFormats.length > 0) {
    // Filter out formats that are not common among all files

    const commonFormats = sharedFormats.filter((format) => {
      return files.every((file) => {
        const fileName = file.name;
        const fileAvailableFormats = availableFormats[fileName];
        return fileAvailableFormats.some((formatObj) => {
          return formatObj.category.some((categoryObj) => {
            return categoryObj.la === category && formatObj[category].includes(format);
          });
        });
      });
    });

    if (commonFormats.length > 0) {
      selectAll.push({ category: category, [category]: commonFormats });
    }
  
  }
});

// Print or use selectAll array as needed
console.log(selectAll);
console.log( 'convertedFiles', convertedFiles);







const handleFileButtonClick = (fileName, index) => {
  setShowConvertChoseMap(prevState => {
    const newKey = `${fileName}_${index}`; // Use a combination of file name and index as the key
    const newState = { ...prevState };
    Object.keys(newState).forEach(key => {
      if (key !== newKey) {
        newState[key] = false; // Close all other open sections
      }
    });
    newState[newKey] = !prevState[newKey]; // TWAVle the clicked file's section
    return newState;
  });
};

const handleClickOutside = (event) => {

  if (!event.target.closest('.convert_button_father') && !event.target.closest('.convert_button_child_icon')  ) {

    setShowConvertChoseMap(prevState => {
      const newState = { ...prevState };
      Object.keys(newState).forEach(key => {
        newState[key] = false; // Close all open sections
      });
      return newState;
    });
  
  }
  if (!event.target.closest('.convert_button_father_selectAll')&& !event.target.closest('.convert_button_child_icon_selectAl') ) {

   setSelectAllCheck(false)
  
  }
    if (!event.target.closest('.chose_device_icon')&& !event.target.closest('.chose_upload_files_container')  ) {

    setIsHovered(false)
  }


  
}
  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

 

const [selectAllCheck , setSelectAllCheck] = useState(false)
const [selectAllCategory , setSelectAllCategory] = useState('')


const handleSellectAllClick = ()=>{
  setSelectAllCheck(
  !selectAllCheck
  )
}

const handleMouseEnter = () => {
  setIsHovered(
    !isHovered
  );
};


useEffect(() => {
  if (convert.length > 0) {
    const completedFiles = convert.filter(item =>
      type.includes(item.fileOutput) && totalConversionProgress[item.fileOutput] === 100    );
    const allCompleted = completedFiles.length === type.length;
    setDownloadAll(allCompleted);
  }
}, [convert, totalConversionProgress]);


console.log('downloadAll' , downloadAll)


const incrementProgress = () => {
  setDefaultProgress((prevProgress) => {
    // TWAVle between incrementing and resetting based on current progress
    const newProgress = prevProgress >= 100 ? 0 : prevProgress + 1;
    return newProgress;
  });
};

// useEffect to start incrementing progress when component mounts
useEffect(() => {
  let timer;
  const startProgress = () => {
    timer = setInterval(() => {
      incrementProgress();
    }, 10); // Increment every 10 milliseconds
  };

  // Simulate backend response delay
  setTimeout(() => {
    startProgress();
  }, 2000); // Simulated delay for backend response

  // Clear interval when component unmounts or when conversion is completed
  return () => clearInterval(timer);
}, []); // Empty dependency array ensures this effect runs only once


const handleOpenNewTab = () => {
  // Replace 'https://example.com' with the URL you want to open in the new tab
  window.open('https://sitfile.com/', '_blank');
};


  return (
   <>

   
   <div className="convert" onDrop={handleDrop}onDragOver={handleDragOver}>
      <Navbar/>
      {/* <h1>Iam:{totalConversionProgress}</h1> */}
      <h1 className='title'>WAV to MP3 Converter</h1>
      <p className='description'>Convert From WAV To MP3 Online Free, Fast, Secure and in few clicks</p>



<div  className='convert_files'>

{
  files.length === 0 ? (
<div className='chose_files_container'
 onDrop={handleDrop}
 onDragOver={handleDragOver}
>

  <div className='chose_device_container '>
  <label htmlFor="fileInput" className="custom-button_device">
<FaFolder className='chose_files_device_icon'/>

  Choose WAV
  <input 
  type="file" 
  id="fileInput" 
  multiple 
  onChange={handleFileChange} 
  className='chose_device_input' 
  WAVept=".WAV" 
/>



</label>
  
{/* {isHovered? <FaAngleUp  className='chose_device_icon'  onClick={handleMouseEnter} /> : <FaAngleDown  className='chose_device_icon' onClick={handleMouseEnter}/>   } */}


</div>
{/* <p className='update'>max file size 1BG <a href='/'>sign Up </a> for more</p> */}
<p className='update'>"      <BsFillLockFill style={{color:"#2ecc71"}} /> Drop your WAV here"</p>



</div>

  ):(

<>

{
!convertedFiles ? (

  <>
    {/* this for button add more */}
    <div className='chose_device_container  chose_device_container_section2'>
  <label htmlFor="fileInput" className="custom-button_device custom-button_device_section2">
<FaFileUpload className='  chose_files_device_icon  chose_files_device_icon_section2'/>

  Add More WAV
  <input 
  type="file" 
  id="fileInput" 
  multiple 
  onChange={handleFileChange} 
  className='chose_device_input' 
  WAVept=".WAV" 
/>


</label>
  
{/* {isHovered? <FaAngleUp  className='chose_device_icon  chose_device_icon_section2'  onClick={handleMouseEnter} /> : <FaAngleDown className='chose_device_icon  chose_device_icon_section2' onClick={handleMouseEnter}/>   } */}


</div>



{files.length > 0 && (
  <div>
   <div className='convert_section_button'>
    {
      files.length > 1 &&(
        <div className='select_all_section'>
        <p className='select_all_p'> Convert All To</p>
        <p className='select_all_p  select_all_p1'> All To</p>

    
    <div className='convert_button_father_selectAll' onClick={handleSellectAllClick}>
    <p className='convert_button_child_button'>
     {
       globalSelectedFormat && files.every((file, index) => {
         return individualSelectedFormats[`${file.name}_${index}`] === globalSelectedFormat;
       }) ? (
         <p>{globalSelectedFormat}</p>
       ) : (
         <p className='select_p'>Select</p>
       )
     }
    </p>
    
         {selectAllCheck ?  <FaAngleUp  className='convert_button_child_icon_selectAl'/> : <FaAngleDown  className='convert_button_child_icon_selectAl'/>}
    
    </div> 
        </div>
      )
    }

    

<button onClick={handleFileUpload} className='button_click_convert'>Convert <BsArrowRight className='icon_convert'/></button>

</div>


{selectAllCheck && (
        <div className='convert_chose_father'>
          <div className='convert_chose convert_chose1'>
            <div className='convert_categories'>
              {selectAll.map((cat, index) => {

                if(!selectAllCategory){
                  setSelectAllCategory(cat.category)
                }
                return(
                  
                <div className='convert_category' onMouseEnter={() => setSelectAllCategory(cat.category)}>
                <div className='convert_category_content'>{cat.category}</div>
                {selectAllCategory === cat.category && <AiOutlineRight className='convert_category_icon' />}
              </div>
                )
                
})}
            </div>

            <ul className='convert_formats'>
            {selectAll.map((formats, index) => (
  Array.isArray(formats[selectAllCategory]) && formats[selectAllCategory].map((format) => (
    <li className='convert_format' onClick={() => {
      setGlobalSelectedFormat(format) ; setSelectAllCheck(!selectAllCheck)
      const updatedFormats = {};
            files.forEach((file , index) => {
              updatedFormats[`${file.name}_${index}`] = format ;
            });
            setIndividualSelectedFormats(updatedFormats);
    }}>
      {format}
    </li>
  ))
))}
            </ul>
          </div>
        </div>
      )}
  </div>
) }


{/* this section who has  file information with select */}
    {files.map((file, index) => (
  <div key={index} >



{/* this is the chosen section */}
<div className='convert_chose_files '>
<p className='convert_chose_files_name'>{file.name}</p>
<div className='convert_chose_files_chose'>
      <div className='convert_button-child_output'>Output: </div>

<div className='convert_button_father' onClick={() => handleFileButtonClick(file.name, index)}>
      
      <p  className='convert_button_child_button'>
        {individualSelectedFormats[`${file.name}_${index}`]}
      </p>
      {showConvertChoseMap[`${file.name}_${index}`] ? <FaAngleUp  className='convert_button_child_icon'/> : <FaAngleDown  className='convert_button_child_icon'/> }

</div>
<AiOutlineCloseCircle  onClick={() => handleFileDelete(`${file.name}_${index}`)} className='convert_chose_files_delete' />
</div>
</div>


{showConvertChoseMap[`${file.name}_${index}`] &&(
<div className='convert_chose_father'>

<div className='convert_chose' >

<div className='convert_categories'>
      {availableFormats[file.name].map((cat, index) => {
        if (!chose[file.name]) {
          setChose(prevState => ({ ...prevState, [file.name]: cat.category[0].la })); // Set chose to the first item in the category array
        }
        return cat.category.map((c) => (
          <div className='convert_category' onMouseEnter={() => setChose(prevState => ({ ...prevState, [file.name]: c.la }))}>
            <div className='convert_category_content' > {c.la}</div>
           
            {chose[file.name] === c.la && (
                    <AiOutlineRight className='convert_category_icon' />
                  )}
            {/* <AiOutlineRight  className='convert_category_icon' /> */}
           </div>
          ));
      })}
    </div>

<ul  className='convert_formats'>
{availableFormats[file.name].map((formats) => (
  formats[chose[file.name]] && formats[chose[file.name]].map((format) => (
    <li
    className='convert_format'
    onClick={() => {
      setIndividualSelectedFormats({
        ...individualSelectedFormats,
        [`${file.name}_${index}`]: format,
      });
      setShowConvertChoseMap(prevState => ({
        ...prevState,
        [`${file.name}_${index}`]: false // Close the convert_chose section when a format is clicked
      }));
    }}
    >
      {format}
    </li>
  ))
))}
</ul>

</div>

</div>
)}
  </div>
))}  


    </>
):(
<div>
  
<div className='converted_convert'>
  <div className='converted_convert_more' onClick={handleOpenNewTab}>
   Convert More <BsBoxArrowUpRight className='converted_convert_more_icon'/>
  </div>
  {
  files.length > 1 &&(
  (
  downloadAll  &&  downloadValidation ? (
    <div className='converted_convert_downloadAll    downloadAll_opacity' onClick={DownloadAll}>
    Download All    <BiDownload className='  converted_convert_more_download  '/> 
    
  </div>):(
    <div className='converted_convert_downloadAll'>
    Download All    <BiDownload className='  converted_convert_more_download'/> 
    
  </div>
  )
  )
  )
  }


  </div>




{files.map((file, index) => {
  const fileName = file.name;
  const fileProgress = conversionProgress[fileName];
  
  const filteredConvertedFiles = convert.filter(
    (item) => type.includes(item.fileOutput) && item.filename === `${fileName}_${index}`
  );

  return (
    fileProgress > 0 && (
      <div key={index} className='uploading'>
        <p className='section1_uploading'>{fileName}</p>
        {filteredConvertedFiles.length > 0   ? (
          filteredConvertedFiles.map((converted, i) => {
            const outputType = converted.fileOutput;
            const totalProgress = totalConversionProgress[outputType];

            return (
              <div key={i} className='section2_uploading'>
                {totalProgress > 0 ? (
                  totalProgress >=99 ? (
                    totalProgress === 100 ? (
                      <>
                      <p className='done_converting'>Done</p>
                     {
                      downloadOne ? (
                        downloadOne1 ? (
                      <button  className='uploading_download '>Download</button>

                        ):(
                      <button  className='uploading_download download_success '>Download</button>

                        )
                      
                      ):(
                      <button onClick={() => handleDownload(converted)} className='uploading_download download_success'>Download</button>
                      
                      )
                     }
                    </>
                    ):(
                      <>
                      <div className='uploading_convert_main'>
                        <div className='progress_rate'>finishing...</div>
                        <progress max="100" value={defaultProgress} className='uploading_progress'></progress>
                      </div>
                      <button className='uploading_download'>Download</button>

                    </>
                    )
                    
                  ) : (
                    <>
                      <div className='uploading_convert_main'>
                        <div className='progress_rate'>Converting {totalProgress}%</div>
                        <progress max="100" value={totalProgress} className='uploading_progress'></progress>
                      </div>
                      <button className='uploading_download'>Download</button>

                    </>
                  )
                ) : (
                  <>
                <div className='uploading_convert_main'>
                <div className='progress_rate'>Converting ...</div>
                  <progress max="100" value={defaultProgress} className='uploading_progress uploading_progress1 '></progress>
                </div>
                <button className='uploading_download'>Download</button>

              </>
                )}
{/* <AiOutlineCloseCircle onClick={() => {
    handleDeleteInProgress(outputType)
    handleFileDelete(`${fileName}_${index}`);
    
    
}} className='convert_chose_files_delete' /> */}

              </div>
            );
          })
        ) : (
          <div className='section2_uploading'>
            {fileProgress === 100 ? (
              <>
                <div className='uploading_convert_main'>
                  <div className='progress_rate'>Converting ...</div>
                  <progress max="100" value={defaultProgress} className='uploading_progress uploading_progress1'></progress>
                </div>
                <button className='uploading_download'>Download</button>
                {/* <button onClick={() => handleDownload(converted)} className='uploading_download download_success'>Download</button> */}

              </>
            ) : (
              <>
                <div className='uploading_convert_main'>
                  <div className='progress_rate'>Uploading {fileProgress}%</div>
                  <progress max="100" value={fileProgress} className='uploading_progress'></progress>
                </div>
                <button className='uploading_download'>Download</button>
               


              </>

            )}
                        {
                          !fileProgress > 0 && (
                            <AiOutlineCloseCircle onClick={() => handleFileDelete(`${fileName}_${index}`)} className='convert_chose_files_delete' />

                          )
                        }

          </div>
        )}

      </div>
    )
  );
})} 




</div>
)
}

</>
)
}


{/* here we have description design */}
<div className='full_section_describe'>
<div className='describe_how_convert'>
  <div className='full_how_convert'>
    <img  className='Arrows' src='/Arrows.png' alt='arrows'/>
    <h2 className='how_convert'>How to convert from WAV to MP3 ?</h2>
    </div>
  <p className='description_p'>1.Begin by selecting your WAV files with the 'Choose WAV' button</p>
  <p className='description_p'>2.Initiate the conversion process by clicking 'Convert to MP3</p>
  <p className='description_p'>3.Once the status reads 'Done', hit 'Download MP3' to retrieve your converted files</p>
</div>

<div className='how_work_cards'>
<div className='how_work_card'>
  <div className='how_work_title'>
    <img className='image_how_work_title'src='/Simplicity.svg' alt='Simplicity'/>
    <h3 className='title_how_work_title'>Simplicity at its Core</h3>
  </div>
  <p className='how_work_description'>
  Just upload your WAV files and tap 'Convert'. Our tool guarantees the highest quality MP3 conversion
  </p>
</div>

<div className='how_work_card'>
  <div className='how_work_title'>
    <img className='image_how_work_title'src='/programming.svg' alt='programming'/>
    <h3 className='title_how_work_title'>Unbeatable Features</h3>
  </div>
  <p className='how_work_description'>
  Effortlessly convert batches of WAV images to MP3 with our tool, which also WAVommodates animated WAV files.  </p>
</div>


<div className='how_work_card'>
  <div className='how_work_title'>
    <img className='image_how_work_title'src='/secure.svg' alt='secure'/>
    <h3 className='title_how_work_title'> Free and Secure</h3>
  </div>
  <p className='how_work_description'>
  Enjoy the benefits of a free, secure, and universally compatible tool WAVessible from any web browser. For added security and privacy, files are automatically deleted after a few hours  </p>
</div>


</div>




</div>













</div>





<Footer/>







</div>


<title>WAV to MP3 Converter</title>
  <meta name="description" content="Convert From WAV To MP3 Online Free, Fast, Secure and in few clicks" />

  <link rel="canonical" href="https://www.sitfile.com/audio/wav-mp3" />

   </>


   
  );

  
}

export default App;
