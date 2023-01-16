import React from "react";
import { Link } from "react-router-dom";

function Home() {
    // const [user, setUser] = useState(null);
    return (
        <>
            <nav class="navbar navbar-default">
                <center>
                    <h1>Home</h1>
                    <table>
                        <tbody>
                            <tr>
                                <td> <Link style={{textDecoration: "none" , color: "rgba(19, 184, 221, 0.857)"}} to= "/login">Login </Link> </td>
                                <td><Link style={{textDecoration: "none" , color: "rgba(19, 184, 221, 0.857)"}} to="/dashboard">Dashboard </Link></td>
                                <td><Link style={{textDecoration: "none" , color: "rgba(19, 184, 221, 0.857)"}} to="/register">Register </Link></td>
                                <td><Link style={{textDecoration: "none" , color: "rgba(19, 184, 221, 0.857)"}} to="/about">About </Link></td>
                            </tr>
                        </tbody>
                    </table>
                    </center>
            </nav>
        </>
    )
}
export default Home;