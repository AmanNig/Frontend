 export default function Prompt(props){
    return (
        <div className={`p-6 max-w-sm mt-5 bg-white border-[#cecdcd] border-4 rounded-2xl shadow-lg flex items-center space-x-4 sm:h-[50%] sm:w-[18vw] hover:bg-slate-200 transition font-mono prompt ${props.className || ''}`} onClick={props.onClick} style={{cursor: props.onClick ? 'pointer' : 'default'}}>
            <div className="shrink-0 border-2 border-[grey] w-12 h-12 rounded-lg text-center flex items-center justify-center text-3xl">
                <i className={props.icon}></i>
            </div>    
            <div>
                <div className="font-bold text-black sm:mt-3 text-lg">{props.text}</div>
                <p className="mb-5 text-sm">
                    {props.para}
                </p>
            </div>
        </div>
    );
 }