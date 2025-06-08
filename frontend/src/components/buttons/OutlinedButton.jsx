const OutlinedButton = ({ index, action }) => {
    return (
        <button
            key={index}
            onClick={action.onClick}
            disabled={action.disabled}
            aria-label={action.label}
            className={`${action.styles} rounded-full border border-slate-300 py-[0.35rem] px-3 text-center text-[0.84rem] transition-all shadow-sm hover:shadow-lg hover:text-white hover:bg-slate-800 hover:border-slate-800 focus:text-white focus:bg-slate-800 focus:border-slate-800 active:border-slate-800 active:text-white active:bg-slate-800 disabled:opacity-50 disabled:shadow-none hover:cursor-pointer" type="button hover:cursor-pointer`}
        >
            <span className={`material-icons ${action.label && ' mr-1.5 '}`}>{action.icon}</span>
            {action.label && (
                <span>{action.label}</span>
            )}

        </button>
    )
}

export default OutlinedButton;