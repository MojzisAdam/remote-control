import React, { useState, useEffect } from "react";
import { User } from "@/api/user/model";
import { getColumns } from "@/components/user-management/columns";
import { DataTable } from "@/components/user-management/data-table";
import { ViewUserModal } from "@/components/user-management/view-user-modal";
import { EditUserModal } from "@/components/user-management/edit-user-modal";
import { CreateUserModal } from "@/components/user-management/create-user-modal";
import { DeleteUserAlert } from "@/components/user-management/delete-user-alert";
import { SortingState } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useUserManagement } from "@/hooks/useUserManagement";
import { Plus } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import withAuthorization from "@/middleware/withAuthorization";
import usePageTitle from "@/hooks/usePageTitle";
import { useTranslation } from "react-i18next";

const UserManagement = () => {
	const { t } = useTranslation("userManagement");
	const { t: tPagination } = useTranslation("pagination");

	const { loading, deleteUser, fetchUsers } = useUserManagement();

	const [users, setUsers] = useState<User[]>([]);
	const [totalPages, setTotalPages] = useState<number>(0);
	const [isInitialLoad, setIsInitialLoad] = useState(true);

	const [from, setFrom] = useState<number>(0);
	const [to, setTo] = useState<number>(0);
	const [totalUsers, setTotalUsers] = useState<number>(0);

	const [userModal, setUserModal] = useState<User>();
	const [viewUserModal, setViewUserModal] = useState<boolean>(false);
	const [editUserModal, setEditUserModal] = useState<boolean>(false);
	const [createUserModal, setCreateUserModal] = useState<boolean>(false);
	const [deleteUserAlert, setDeleteUserAlert] = useState<boolean>(false);

	const { toast } = useToast();
	usePageTitle(t("userManagement.title"));

	const [query, setQuery] = useState<{
		page: number;
		search: string;
		sorting: SortingState;
		pageSize: number;
	}>({
		page: 1,
		search: "",
		sorting: [],
		pageSize: 10,
	});

	const [searchInput, setSearchInput] = useState<string>("");
	const debouncedSearch = useDebounce(searchInput, 500);

	useEffect(() => {
		setQuery((prev) => {
			if (prev.search === debouncedSearch) {
				return prev;
			}
			return { ...prev, search: debouncedSearch, page: 1 };
		});
	}, [debouncedSearch]);

	const loadUsers = async () => {
		try {
			const response = await fetchUsers({
				page: query.page,
				pageSize: query.pageSize,
				search: query.search,
				sorting: query.sorting,
			});
			if (response.success) {
				setUsers(response.data.data);
				setTotalPages(response.data.meta.last_page || 0);
				setFrom(response.data.meta.from || 0);
				setTo(response.data.meta.to || 0);
				setTotalUsers(response.data.meta.total || 0);
			}
		} catch (error) {
			console.log("Error fetching users:", error);
		} finally {
			if (isInitialLoad) {
				setIsInitialLoad(false);
			}
		}
	};

	useEffect(() => {
		loadUsers();
	}, [query]);

	const handleSortingChange = (newSorting: SortingState) => {
		setQuery((prev) => ({
			...prev,
			sorting: newSorting,
			page: 1,
		}));
	};

	const handlePageSizeChange = (newPageSize: number) => {
		setQuery((prev) => ({
			...prev,
			pageSize: newPageSize,
			page: 1,
		}));
	};

	const handlePreviousPage = () => {
		setQuery((prev) => ({
			...prev,
			page: prev.page - 1,
		}));
	};

	const handleNextPage = () => {
		setQuery((prev) => ({
			...prev,
			page: prev.page + 1,
		}));
	};

	const viewUser = (user: User) => {
		setUserModal(user);
		setViewUserModal(true);
	};

	const editUser = (user: User) => {
		setUserModal(user);
		setEditUserModal(true);
	};

	const createUser = () => {
		setCreateUserModal(true);
	};

	const onCreateUser = (email: string) => {
		toast({
			title: t("userManagement.notifications.userCreated"),
			description: t("userManagement.notifications.userCreatedDescription", { email }),
		});
		loadUsers();
	};

	const onEditUser = (updatedUser: User) => {
		setUsers((prevUsers) => prevUsers.map((user) => (user.id === updatedUser.id ? { ...user, ...updatedUser } : user)));
	};

	const deleteUserModal = (user: User) => {
		setUserModal(user);
		setDeleteUserAlert(true);
	};

	const onDeleteUser = async (confirmed: boolean, user: User | undefined) => {
		let userId = -1;
		if (user?.id) {
			userId = user.id;
		}

		if (confirmed) {
			try {
				const result = await deleteUser(userId);
				if (result.success) {
					toast({
						title: t("userManagement.notifications.userDeleted"),
						description: t("userManagement.notifications.userDeletedDescription", { email: user?.email }),
					});
					loadUsers();
				} else {
					toast({
						title: t("userManagement.notifications.error"),
						description: t("userManagement.notifications.errorDescription"),
					});
				}
			} catch {
				toast({
					title: t("userManagement.notifications.error"),
					description: t("userManagement.notifications.errorDescription"),
				});
			}
		}
	};

	const columns = getColumns(t);

	const updatedColumns = columns.map((column) => {
		if (column.id === "actions") {
			return {
				...column,
				meta: {
					viewUser,
					editUser,
					deleteUserModal,
				},
			};
		}
		return column;
	});

	return (
		<>
			<div className="mb-4">
				<Button onClick={() => createUser()}>
					<Plus />
				</Button>
			</div>
			<DataTable
				columns={updatedColumns}
				data={users}
				sorting={query.sorting}
				pageSize={query.pageSize}
				onSortingChange={handleSortingChange}
				onSearchChange={setSearchInput}
				onPageSizeChange={handlePageSizeChange}
				loading={loading}
				isInitialLoad={isInitialLoad}
			/>
			<div className="flex items-center justify-between space-x-2 py-4">
				<div className="flex-1 text-sm text-muted-foreground">
					<p>{tPagination("showing", { from, to, total: totalUsers })}</p>
				</div>
				<div className="flex items-center justify-end space-x-2 py-4">
					<Button
						variant="outline"
						size="sm"
						onClick={handlePreviousPage}
						disabled={query.page <= 1}
					>
						{tPagination("previous")}
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={handleNextPage}
						disabled={query.page >= totalPages}
					>
						{tPagination("next")}
					</Button>
				</div>
			</div>
			<ViewUserModal
				open={viewUserModal}
				onOpenChange={setViewUserModal}
				data={userModal}
			/>
			<EditUserModal
				open={editUserModal}
				onSuccess={onEditUser}
				onOpenChange={setEditUserModal}
				data={userModal}
			/>
			<CreateUserModal
				open={createUserModal}
				onSuccess={onCreateUser}
				onOpenChange={setCreateUserModal}
			/>
			<DeleteUserAlert
				open={deleteUserAlert}
				onSuccess={onDeleteUser}
				onOpenChange={setDeleteUserAlert}
				user={userModal}
			/>
		</>
	);
};

export default withAuthorization(UserManagement, "manage-users");
