const Spinner = () => {
    return (
        <div className="flex flex-col h-32 justify-center items-center">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-2 ml-2 text-[0.95rem] text-center">Loading...</p>
        </div>
    );
};

export default Spinner;
