import Slideshow from './components/Slideshow';

export default function App() {
  return (
    <div className="app">
      <Slideshow interval={3000} />
    </div>
  );
}
