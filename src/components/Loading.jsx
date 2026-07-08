// Loading.jsx
import styles from './Loading.module.css';

const Loading = ({ isLoading }) => {
    // Si no está cargando, retornamos un div con una clase que lo oculte
    return (
        <div className={`${styles.overlay} ${!isLoading ? styles.hidden : ''}`}>
            <div className={styles.ventanaCarga}>
                <div className={styles.spinner}></div>
                <p className={styles.textoCargando}>Cargando...</p>
            </div>
        </div>
    );
};

export default Loading;