import { ProgressSpinner } from 'primereact/progressspinner';
const Spinner = () => {
    return (
        <div className="spinner-container">
            <ProgressSpinner style={{width: '50px', height: '50px'}} strokeWidth="8"  animationDuration=".5s" />
        </div>
    );
}
export default Spinner;