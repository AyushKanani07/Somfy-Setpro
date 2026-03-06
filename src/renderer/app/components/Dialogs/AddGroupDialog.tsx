import { useGroupView } from '~/hooks/useGroupView';
import { SetProButton } from '../sharedComponent/setProButton'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { useEffect } from 'react';

type AddGroupDialogProps = {
    open: boolean;
    title?: string;
    selectedValue: string;
    loading?: boolean;

    onOpenChange: (open: boolean) => void;
    onSelectChange: (value: string) => void;
    onCancel: () => void;
    onSave: () => void;
};

export const AddGroupDialog: React.FC<AddGroupDialogProps> = ({
    open,
    title = "Add to Group",
    selectedValue,
    loading = false,
    onOpenChange,
    onSelectChange,
    onSave,
    onCancel
}) => {
    const { groups, fetchGroupsThunk } = useGroupView();
    useEffect(() => {
        if (groups.length === 0) {
            fetchGroupsThunk();
        };
    }, []);
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>

                <div className="py-4">
                    <Select value={selectedValue} onValueChange={onSelectChange}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select Group" />
                        </SelectTrigger>
                        <SelectContent>
                            {
                                groups.map(group => (
                                    <SelectItem key={group.group_id} value={group.group_id.toString()}>
                                        {group.name}-{group.address}
                                    </SelectItem>
                                ))
                            }
                        </SelectContent>
                    </Select>
                </div>

                <DialogFooter>
                    <SetProButton buttonType="cancel" onClick={onCancel} disabled={loading}>
                        Cancel
                    </SetProButton>
                    <SetProButton type='submit' onClick={onSave} disabled={loading || !selectedValue} loading={loading}>
                        Save
                    </SetProButton>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
