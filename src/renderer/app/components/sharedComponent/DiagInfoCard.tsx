function InfoCard({ title, count }: { title: string; count: string | number }) {
    return (
        <div className="max-w-80 w-full rounded-lg shadow-md overflow-hidden flex flex-col">
            <div className="bg-slate-800 text-white min-h-[51px] max-h-[51px] flex items-center font-semibold">
                <div className="pl-1 pr-1 mx-auto font-semibold leading-tight text-ellipsis line-clamp-3">{title}</div>
            </div>
            <div>
                <div className="text-2xl m-2 font-semibold leading-tight">
                    {count}
                </div>
            </div>
        </div>
    )
}

export default InfoCard;