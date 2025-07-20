import Leadercompo from "./leadercompo";
import Button from '@mui/material/Button';
export default function Leaderboard(){
    
    return(
        <div className="leader-container h-[100%] w-[100%] absolute">
            <Button variant="contained" className="absolute left-[90%] top-6"><a href="/">Home</a></Button>
                <div className=" lead-heading text-[450%] absolute z-10 left-[36%] top-1 font-bold bg-[white] rounded-t-[20px] px-[15px]  ">
                    <h1>Leaderboard</h1>
                </div>
            <div className=" showcase h-[80vh] w-[70%] bg-[white] absolute left-[15%] top-[15%] rounded-[20px] flex flex-col gap-[20px] overflow-y-scroll px-[20px]">
                <div className="w-[100%]">
                    <Leadercompo/>
                </div>
            </div>

        </div>
    );
};
