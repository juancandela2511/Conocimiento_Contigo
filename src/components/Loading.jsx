// Loading.jsx
import styles from './Loading.module.css';

// Este componente es puramente presentacional. El componente padre decide si se muestra o no.
const Loading = () => {
    return (
        <div className={styles.overlay}>
            <div className={styles.ventanaCarga}>
                <div className={styles.spinner}></div>
                <p className={styles.textoCargando}>Cargando...</p>
            </div>
        </div>
    );
};

export default Loading;