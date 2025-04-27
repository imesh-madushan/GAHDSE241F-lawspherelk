const FilledButton = ({ text, icon }) => {
    return (
        <button type="button" className="text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-1 focus:ring-blue-300 font-medium rounded-xl text-sm px-4 py-2 text-center me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
            {icon}
            {text}
        </button>
    );
}

export default FilledButton;