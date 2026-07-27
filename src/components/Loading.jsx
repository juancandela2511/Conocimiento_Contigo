// Loading.jsx
import { ClipLoader } from 'react-spinners';
import styles from './Loading.module.css';

// Este componente es puramente presentacional. El componente padre decide si se muestra o no.
const Loading = () => {
    return (
        // Ahora es un contenedor más pequeño y no un overlay de pantalla completa.
        <div className={styles.loadingContainer}>
            {/* Usamos un spinner de la librería que instalaste */}
            <ClipLoader color="#066af7" size={40} />
        </div>
    );
};

export default Loading;