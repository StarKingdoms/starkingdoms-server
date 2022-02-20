function modifyHub(module) {
    module.type = "hub";
    module.shouldAttach = null;
    module.base = {exists:true,joint:null,hasModule:false};
    module.down = {exists:true,joint:null,hasModule:false};
    module.right = {exists:true,joint:null,hasModule:false};
    module.left = {exists:true,joint:null,hasModule:false};
    return module;
}

exports.modifyHub = modifyHub;

