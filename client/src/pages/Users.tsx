import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusIcon, SearchIcon } from "@/lib/icons";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function Users() {
  const [searchTerm, setSearchTerm] = useState("");
  
  // This would be fetched from the API in a real implementation
  const users = [
    { id: 1, username: "admin", email: "admin@example.com", isAdmin: true },
    { id: 2, username: "johndoe", email: "john@example.com", isAdmin: false },
    { id: 3, username: "janedoe", email: "jane@example.com", isAdmin: false },
  ];
  
  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <Button>
          <PlusIcon className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>
      
      <Card className="bg-white rounded-lg shadow overflow-hidden">
        <CardHeader className="px-4 py-5 sm:px-6 bg-white border-b border-gray-200">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg leading-6 font-medium text-gray-900">
              Users
            </CardTitle>
            <div className="relative">
              <div className="flex items-center">
                <SearchIcon className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  className="pl-9"
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-4 py-5 sm:p-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map(user => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      {user.isAdmin ? (
                        <Badge className="bg-blue-100 text-blue-800">Admin</Badge>
                      ) : (
                        <Badge variant="outline">User</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm">Edit</Button>
                        <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700">
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
