import styles from './animalEditor.module.css';

import EditorForm from '../editorForm/EditorForm';
import AnimalCard, { AnimalCardProps } from '../../../../utils/global/animalCard/AnimalCard';
import AnimalButton from '../../../../utils/global/animalButton/AnimalButton';
import ConfirmModal from '../confirmModal/ConfirmModal';
import LoadingOverlay from '../loadingOverlay/LoadingOverlay';

//icons
import deleteIcon from '../../../../assets/buttonIcons/delete.svg';
import saveIcon from '../../../../assets/buttonIcons/save.svg';

import { Link, useNavigate } from 'react-router-dom';
import { ChangeEvent, useState } from 'react';

//utils
import { server } from '../../../../utils/constants';

interface AnimalEditorProps {
  cardData: AnimalCardProps["cardData"]
  onChangeImg: (event: ChangeEvent<HTMLInputElement>) => void
  onEditForm: (inputProperty: string, inputValue: string) => void
  editMode: "create" | "update"
}
export default function AnimalEditor(props: AnimalEditorProps) {
  const [openConfirmModal, setOpenConfirmModal] = useState(false)
  const [loading, setLoading] = useState(false)

  let navigate = useNavigate()

  const save = async () =>{
    setLoading(true)

    const formData = new FormData()

    //create image from url
    const URL = props.cardData.img.src    
    var request = new XMLHttpRequest();
    request.responseType = "blob";
    request.open("GET", URL);
    request.send();

    request.onload = async function() {
      const filename = props.cardData.name+"."+request.response.type.replace("image/", "")
      const blob = new Blob([request.response], {type: request.response.type})
      const image = new File([blob], filename, {type: request.response.type})

      // set up data to send
      formData.append('img', image)
      formData.append('name', props.cardData.name)
      formData.append('species', props.cardData.species)
      formData.append('scientificName', props.cardData.scientificName)
      formData.append('sex', props.cardData.sex ? props.cardData.sex : "Unknown")
      if(!isNaN(Number(new Date(props.cardData.dateOfBirth))))//check if date exists (is valid)
        formData.append('dateOfBirth', new Date(props.cardData.dateOfBirth).toUTCString())
      else
        formData.append('dateOfBirth', "unknown")
      formData.append('iucnStatus', props.cardData.iucnStatus)
      formData.append('story', props.cardData.story)
      formData.append('conservationMission', props.cardData.conservationMission)

      let url = server.url+'/api/animals/' ;
      //post request
      if(props.editMode === "update"){
        url += props.cardData._id
      }

      const response = await fetch(url , {
        method: props.editMode === 'update' ? 'PATCH' :'POST',
        body: formData
      })
      await response.json().then(() => {
        navigate('/')
      })
    }

  }

  return (
    <div className={styles.page}>
      {loading ? <LoadingOverlay/> : null}
      {openConfirmModal ?
        <ConfirmModal 
          changeOpenConfirmModal={(openModal)=>setOpenConfirmModal(openModal)}
          deleteId = {props.cardData._id}
          setLoading = {()=>setLoading(true)}
        />: null
      }
      <Link to={"/"}>
        <button className={styles.backButton}>&#11164;</button>
      </Link>
      <div className={styles.animalEditor}>
        <div className={styles.editor}>
          <EditorForm
            cardData={{
              ...props.cardData,
              dateOfBirth: new Date(props.cardData.dateOfBirth)
            }}
            changeImg={(e: ChangeEvent<HTMLInputElement>)=>props.onChangeImg(e)}
            editForm={(property: string, value: string)=>props.onEditForm(property, value)}
          />
          <div className={styles.buttons}>
            <button onClick={()=>setOpenConfirmModal(true)} className={styles.delete} style={props.editMode === "create" ? {visibility: "hidden"} :  {}}>
              <img src={deleteIcon} alt="Trash Can Icon"/> 
              <span>Delete</span>
            </button>
            <button className={styles.save} onClick={()=>save()}>
              <img src={saveIcon} alt="Floppy Disc Icon"/> 
              <span>Save</span>
            </button>
          </div>
        </div>
        <div className={styles.preview}>
          <AnimalCard
            cardData={{
              ...props.cardData,
              dateOfBirth: new Date(props.cardData.dateOfBirth)
            }}
          /> 
          <AnimalButton
            name={props.cardData.name}
            species={props.cardData.species}
            img={props.cardData.img}
          />
        </div>
      </div>
    </div>
  )
}