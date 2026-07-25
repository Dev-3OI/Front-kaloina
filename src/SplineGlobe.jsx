export default function SplineGlobe() {
    return (
        <div className="spline-globe-frame">
            <iframe
                src="https://my.spline.design/worldplanet-dralHcmiRP45aGVMSRlcC8bR/"
                title="Globe terrestre"
                loading="lazy"
                style={{ border: 'none', width: '100%', height: '100%' }}
                allow="fullscreen"
            />
            <div className="spline-logo-mask" />
        </div>
    );
}